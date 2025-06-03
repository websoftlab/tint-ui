import type { Config } from "./get-config";
import fs from "fs-extra";
import prompts from "prompts";
import { highlighter } from "./highlighter";
import { logger } from "./logger";
import path from "path";
import { spinner } from "./spinner";

export async function updateApp(config: Config) {
	const appFile = config.resolvedPaths.app;
	const isLayout = config.ts && config.path.app.includes("_layout");
	const isStyle = config.mode === "style";

	let install = true;
	let importLine = `import { ThemeContextProvider } from "@/components/theme";`;

	if (fs.existsSync(appFile)) {
		install = false;
		const { overwrite } = await prompts({
			type: "confirm",
			name: "overwrite",
			message: `The file ${highlighter.info(appFile)} already exists. Would you like to overwrite?`,
			initial: false,
		});

		if (!overwrite) {
			logger.log(
				`For the proper use of components and styles, you need to include the styles in the main template:`
			);
			logger.log(`Import: ${highlighter.info(importLine)}`);
			if (!isStyle) {
				logger.log(
					`And use the context: ${highlighter.info(`<ThemeContextProvider> ... </ThemeContextProvider>`)}`
				);
			}
			logger.break();
			return;
		}
	} else {
		const dirName = path.dirname(appFile);
		if (!fs.pathExistsSync(dirName)) {
			fs.mkdirSync(dirName, { recursive: true });
		}
	}

	const importCss = path.dirname(config.resolvedPaths.tailwindCss) === path.dirname(appFile);
	if (importCss) {
		importLine += `\nimport "./${path.basename(config.resolvedPaths.tailwindCss)}";`;
	}
	const code = `import * as React from "react";
${importLine}

export default function App${isLayout ? "Layout" : "Page"}(${
		isLayout ? `{ children }${config.ts ? ` : { children: React.ReactNode }` : ``}` : ``
	}) {
	return (
		<ThemeContextProvider>
			${isLayout ? `{ children }` : `<div>App main page</div>`}
		</ThemeContextProvider>
	);
}
`;

	const updateSpinner = spinner(install ? `Install app file.` : `Update app file.`).start();
	await fs.writeFile(appFile, code, "utf-8");
	updateSpinner.succeed();
}
