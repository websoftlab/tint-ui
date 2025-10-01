import type { Config } from "./get-config";

import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileExists, pathExists, writeFile } from "./fs";
import { spinner } from "./spinner";

export async function updateTheme(config: Config) {
	const themeFile = path.resolve(config.resolvedPaths.components, "theme/index." + (config.ts ? "tsx" : "jsx"));
	if (await fileExists(themeFile)) {
		return;
	}

	const dirName = path.dirname(themeFile);
	if (!(await pathExists(dirName))) {
		await mkdir(dirName, { recursive: true });
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
	await writeFile(themeFile, code);
	baseSpinner.succeed();
}
