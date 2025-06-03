import path from "path";
import { highlighter } from "./highlighter";
import { resolveImport } from "./resolve-import";
import { cosmiconfig } from "cosmiconfig";
import { loadConfig } from "tsconfig-paths";
import { z } from "zod";

export const DEFAULT_COMPONENTS = "@/components";
export const DEFAULT_APP = "app/page";
export const DEFAULT_TAILWIND_CSS = "app/globals.css";
export const DEFAULT_TAILWIND_CONFIG = "tailwind.config.js";

// A simple components.json file would be nice.
const explorer = cosmiconfig("components", {
	searchPlaces: ["components.json"],
});

export const rawConfigSchema = z
	.object({
		mode: z.string(),
		ts: z.coerce.boolean().default(true),
		tailwind: z.object({
			config: z.string(),
			css: z.string(),
			baseColor: z.string(),
			cssVariables: z.boolean().default(true),
			prefix: z.string().default("").optional(),
		}),
		path: z.object({
			app: z.string(),
		}),
		aliases: z.object({
			components: z.string(),
		}),
	})
	.strict();

export type RawConfig = z.infer<typeof rawConfigSchema>;

export const configSchema = rawConfigSchema.extend({
	resolvedPaths: z.object({
		cwd: z.string(),
		app: z.string(),
		tailwindConfig: z.string(),
		tailwindCss: z.string(),
		components: z.string(),
	}),
});

export type Config = z.infer<typeof configSchema>;

export async function getConfig(cwd: string) {
	const config = await getRawConfig(cwd);
	if (!config) {
		return null;
	}
	return await resolveConfigPaths(cwd, config);
}

export async function resolveConfigPaths(cwd: string, config: RawConfig) {
	// Read tsconfig.json.
	const tsConfig = loadConfig(cwd);

	if (tsConfig.resultType === "failed") {
		throw new Error(`Failed to load ${config.ts ? "tsconfig" : "jsconfig"}.json. ${tsConfig.message ?? ""}`.trim());
	}

	return configSchema.parse({
		...config,
		resolvedPaths: {
			cwd,
			app: path.resolve(cwd, config.path.app),
			tailwindConfig: path.resolve(cwd, config.tailwind.config),
			tailwindCss: path.resolve(cwd, config.tailwind.css),
			components: await resolveImport(config.aliases["components"], tsConfig),
		},
	});
}

export async function getRawConfig(cwd: string): Promise<RawConfig | null> {
	try {
		const configResult = await explorer.search(cwd);
		if (!configResult) {
			return null;
		}
		return rawConfigSchema.parse(configResult.config);
	} catch (error) {
		const componentPath = `${cwd}/components.json`;
		throw new Error(`Invalid configuration found in ${highlighter.info(componentPath)}.`);
	}
}
