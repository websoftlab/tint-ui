import type { Config } from "./get-config";
import fs from "fs-extra";
import path from "path";
import { spinner } from "./spinner";

export async function updateTheme(config: Config) {
	const themeFile = path.resolve(config.resolvedPaths.components, "theme/index." + (config.ts ? "tsx" : "jsx"));
	if (fs.existsSync(themeFile)) {
		return;
	}

	const dirName = path.dirname(themeFile);
	if (!fs.pathExistsSync(dirName)) {
		fs.mkdirSync(dirName, { recursive: true });
	}

	const isTs = config.ts;
	const code = `"use client";

import * as React from "react";
import { ThemeStore, ThemeContext } from "@tint-ui/theme";

const classes = {};
const icons = {};
const mixin = {};
const themeStore${isTs ? `: ThemeStore` : ``} = new ThemeStore({ classes, icons, mixin });

export function ThemeContextProvider({ children }${isTs ? `: { children: React.ReactNode }` : ``}) {
	return <ThemeContext.Provider value={themeStore}>{children}</ThemeContext.Provider>;
}
`;

	const baseSpinner = spinner(`Install theme.`).start();
	await fs.writeFile(themeFile, code, "utf-8");
	baseSpinner.succeed();
}
