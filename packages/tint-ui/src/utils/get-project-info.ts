import path from "path";
import { FRAMEWORKS, type Framework } from "./frameworks";
import { Config, RawConfig, getConfig, resolveConfigPaths } from "./get-config";
import { getPackageInfo } from "./get-package-info";
import fg from "fast-glob";
import fs from "fs-extra";
import { loadConfig } from "tsconfig-paths";
import { z } from "zod";

export interface ProjectInfo {
	framework: Framework;
	isSrcDir: boolean;
	isTs: boolean;
	appFile: string;
	tailwindConfigFile: string | null;
	tailwindCssFile: string | null;
	aliasPrefix: string | null;
}

const PROJECT_SHARED_IGNORE = ["**/node_modules/**", ".next", "public", "dist", "build"];

const TS_CONFIG_SCHEMA = z.object({
	compilerOptions: z.object({
		paths: z.record(z.string().or(z.array(z.string()))),
	}),
});

export async function getProjectInfo(cwd: string): Promise<ProjectInfo> {
	const [configFiles, isSrcDir, isTs, tailwindConfigFile, tailwindCssFile, aliasPrefix, packageJson] =
		await Promise.all([
			fg.glob("**/{next,vite,astro,phragon}.config.*|gatsby-config.*|composer.json", {
				cwd,
				deep: 3,
				ignore: PROJECT_SHARED_IGNORE,
			}),
			fs.pathExists(path.resolve(cwd, "src")),
			isTypeScriptProject(cwd),
			getTailwindConfigFile(cwd),
			getTailwindCssFile(cwd),
			getTsConfigAliasPrefix(cwd),
			getPackageInfo(cwd, false),
		]);

	const isUsingAppDir = await fs.pathExists(path.resolve(cwd, `${isSrcDir ? "src/" : ""}app`));

	const type: ProjectInfo = {
		framework: FRAMEWORKS["manual"],
		appFile: `app/page.${isTs ? "tsx" : "jsx"}`,
		isSrcDir,
		isTs,
		tailwindConfigFile,
		tailwindCssFile,
		aliasPrefix,
	};

	// Next.js.
	if (configFiles.find((file) => file.startsWith("next.config."))?.length) {
		type.framework = isUsingAppDir ? FRAMEWORKS["next-app"] : FRAMEWORKS["next-pages"];
		return type;
	}

	// Astro.
	if (configFiles.find((file) => file.startsWith("astro.config."))?.length) {
		type.framework = FRAMEWORKS["astro"];
		return type;
	}

	// Gatsby.
	if (configFiles.find((file) => file.startsWith("gatsby-config."))?.length) {
		type.framework = FRAMEWORKS["gatsby"];
		return type;
	}

	// Laravel.
	if (configFiles.find((file) => file.startsWith("composer.json"))?.length) {
		type.framework = FRAMEWORKS["laravel"];
		return type;
	}

	// Remix.
	if (Object.keys(packageJson?.dependencies ?? {}).find((dep) => dep.startsWith("@remix-run/"))) {
		type.framework = FRAMEWORKS["remix"];
		return type;
	}

	// Vite.
	// Some Remix templates also have a vite.config.* file.
	// We'll assume that it got caught by the Remix check above.
	if (configFiles.find((file) => file.startsWith("vite.config."))?.length) {
		type.framework = FRAMEWORKS["vite"];
		return type;
	}

	// Phragon.
	if (configFiles.find((file) => file.startsWith("phragon.config."))?.length) {
		type.framework = FRAMEWORKS["phragon"];
		type.appFile = `src-client/_layout/index.${type.isTs ? "tsx" : "jsx"}`;
		return type;
	}

	return type;
}

export async function getTailwindCssFile(cwd: string) {
	const files = await fg.glob(["**/*.css", "**/*.scss"], {
		cwd,
		deep: 5,
		ignore: PROJECT_SHARED_IGNORE,
	});

	if (!files.length) {
		return null;
	}

	for (const file of files) {
		const contents = await fs.readFile(path.resolve(cwd, file), "utf8");
		// Assume that if the file contains `@tailwind base` it's the main css file.
		if (contents.includes("@tailwind base")) {
			return file;
		}
	}

	return null;
}

export async function getTailwindConfigFile(cwd: string) {
	const files = await fg.glob("tailwind.config.*", {
		cwd,
		deep: 3,
		ignore: PROJECT_SHARED_IGNORE,
	});

	if (!files.length) {
		return null;
	}

	return files[0];
}

export async function getTsConfigAliasPrefix(cwd: string) {
	const tsConfig = loadConfig(cwd);

	if (tsConfig?.resultType === "failed" || !Object.entries(tsConfig?.paths).length) {
		return null;
	}

	// This assume that the first alias is the prefix.
	for (const [alias, paths] of Object.entries(tsConfig.paths)) {
		if (
			paths.includes("./*") ||
			paths.includes("./src/*") ||
			paths.includes("./app/*") ||
			paths.includes("./resources/js/*") // Laravel.
		) {
			return alias.replace(/\/\*$/, "") ?? null;
		}
	}

	// Use the first alias as the prefix.
	return Object.keys(tsConfig?.paths)?.[0].replace(/\/\*$/, "") ?? null;
}

export async function isTypeScriptProject(cwd: string) {
	const files = await fg.glob("tsconfig.*", {
		cwd,
		deep: 1,
		ignore: PROJECT_SHARED_IGNORE,
	});

	return files.length > 0;
}

export async function getTsConfig(cwd: string) {
	for (const fallback of ["tsconfig.json", "tsconfig.web.json", "tsconfig.app.json"]) {
		const filePath = path.resolve(cwd, fallback);
		if (!(await fs.pathExists(filePath))) {
			continue;
		}

		// We can't use fs.readJSON because it doesn't support comments.
		const contents = await fs.readFile(filePath, "utf8");
		const cleanedContents = contents.replace(/\/\*\s*\*\//g, "");
		const result = TS_CONFIG_SCHEMA.safeParse(JSON.parse(cleanedContents));

		if (result.error) {
			continue;
		}

		return result.data;
	}

	return null;
}

export async function getProjectConfig(
	cwd: string,
	defaultProjectInfo: ProjectInfo | null = null
): Promise<Config | null> {
	// Check for existing component config.
	const [existingConfig, projectInfo] = await Promise.all([
		getConfig(cwd),
		!defaultProjectInfo ? getProjectInfo(cwd) : Promise.resolve(defaultProjectInfo),
	]);

	if (existingConfig) {
		return existingConfig;
	}

	if (!projectInfo || !projectInfo.tailwindConfigFile || !projectInfo.tailwindCssFile) {
		return null;
	}

	const config: RawConfig = {
		ts: projectInfo.isTs,
		mode: "sass",
		tailwind: {
			config: projectInfo.tailwindConfigFile,
			baseColor: "zinc",
			css: projectInfo.tailwindCssFile,
			cssVariables: true,
			prefix: "",
		},
		path: {
			app: projectInfo.appFile,
		},
		aliases: {
			components: `${projectInfo.aliasPrefix}/components`,
		},
	};

	return await resolveConfigPaths(cwd, config);
}
