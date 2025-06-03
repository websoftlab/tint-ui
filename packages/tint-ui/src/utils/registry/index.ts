import type { Config } from "../get-config";
import type {
	RegistryItemCssVarsSchema,
	RegistryItemSchema,
	RegistryItemTailwindSchema,
	RegistryOptionSchema,
	RegistryResolvedItemsTreeSchema,
} from "./types";

import { handleError } from "../handle-error";
import { highlighter } from "../highlighter";
import { logger } from "../logger";
import { components } from "./components";
import { icons } from "./icons";
import * as colors from "./colors";
import deepmerge from "deepmerge";
import { mergeArrayString } from "../merge-array-string";
import { buildTailwindThemeColorsFromCssVars } from "../updaters/update-tailwind-config";

export function getRegistryIndex() {
	return components;
}

export function hasRegistryComponent(name: string) {
	return components.some((item) => item.name === name);
}

export function getRegistryModes(): RegistryOptionSchema[] {
	return [
		{
			name: "css",
			label: "CSS module",
		},
		{
			name: "sass",
			label: "SASS module",
		},
	];
}

export function getRegistryBaseColors(): RegistryOptionSchema[] {
	return [
		{
			name: "neutral",
			label: "Neutral",
		},
		{
			name: "gray",
			label: "Gray",
		},
		{
			name: "zinc",
			label: "Zinc",
		},
		{
			name: "stone",
			label: "Stone",
		},
		{
			name: "slate",
			label: "Slate",
		},
		{
			name: "blue",
			label: "Blue",
		},
		{
			name: "green",
			label: "Green",
		},
		{
			name: "orange",
			label: "Orange",
		},
		{
			name: "red",
			label: "Red",
		},
		{
			name: "rose",
			label: "Rose",
		},
		{
			name: "violet",
			label: "Violet",
		},
		{
			name: "yellow",
			label: "Yellow",
		},
	];
}

export function getRegistryIcons(baseIcons?: string[]) {
	if (!baseIcons) {
		return icons.slice();
	}
	return icons.filter((item) => baseIcons.includes(item.name));
}

export function getRegistryBaseColor(baseColor: string) {
	const result = colors[baseColor as keyof typeof colors];
	if (!result) {
		handleError(
			`The base color at ${baseColor} was not found.\nIt may not exist at the registry. Please make sure it is a valid color.`
		);
	}
	return result;
}

function getRegistryComponents(paths: string[]) {
	const results: RegistryItemSchema[] = [];
	for (const path of paths) {
		if (path === "theme") {
			continue;
		}
		const component = components.find((item) => item.name === path);
		if (component) {
			results.push(component);
		} else {
			logger.log("\n");
			handleError(
				new Error(
					`The component at ${highlighter.info(
						path
					)} was not found.\nIt may not exist at the registry. Please make sure it is a valid component.`
				)
			);
		}
	}
	return results;
}

export function registryResolveItemsTree(names: string[], config: Config, initialize = false) {
	let registryDependencies: string[] = [];
	for (const name of names) {
		const itemRegistryDependencies = resolveRegistryDependencies(name);
		registryDependencies = mergeArrayString(registryDependencies, itemRegistryDependencies);
	}

	const payload = getRegistryComponents(registryDependencies);
	if (initialize) {
		const theme = registryGetTheme(config);
		if (theme) {
			payload.unshift(theme);
		}
	}

	if (!payload.length) {
		return null;
	}

	let tailwind: RegistryItemTailwindSchema = {};
	let cssVars: RegistryItemCssVarsSchema = {};
	let icons: string[] = [];
	let dependencies: string[] = [];
	let docs = "";

	payload.forEach((item) => {
		if (item.tailwind) {
			tailwind = deepmerge(tailwind, item.tailwind);
		}
		if (item.cssVars) {
			cssVars = deepmerge(cssVars, item.cssVars);
		}
		if (item.icons) {
			icons = mergeArrayString(icons, item.icons);
		}
		dependencies.push(item.module);
		if (item.dependencies) {
			dependencies = mergeArrayString(dependencies, item.dependencies);
		}
		if (item.docs) {
			docs += `${item.docs}\n`;
		}
	});

	return {
		components: payload.map((item) => ({
			name: item.name,
			module: item.module,
			withStyles: item.withStyles,
		})),
		dependencies,
		tailwind,
		cssVars,
		icons,
		docs,
	} as RegistryResolvedItemsTreeSchema;
}

function resolveRegistryDependencies(name: string): string[] {
	const payload: string[] = [];

	function resolveDependencies(localName: string, tree: string[] = []) {
		const component = components.find((item) => item.name === localName);
		if (!component) {
			return console.error(`The ${localName} component not found`);
		}

		if (tree.includes(localName)) {
			return;
		}

		tree.push(localName);
		if (component.registryDependencies) {
			for (const dependency of component.registryDependencies) {
				resolveDependencies(dependency, tree);
			}
		}

		payload.push(localName);
	}

	resolveDependencies(name);
	return Array.from(new Set(payload));
}

export function registryGetTheme(config: Config) {
	const baseColor = getRegistryBaseColor(config.tailwind.baseColor);
	if (!baseColor) {
		return null;
	}

	const theme = {
		name: "theme",
		module: "@tint-ui/theme",
		dependencies: ["mobx"],
		withStyles: false,
		tailwind: {
			config: {
				theme: {
					extend: {
						borderRadius: {
							lg: "var(--radius)",
							md: "calc(var(--radius) - 2px)",
							sm: "calc(var(--radius) - 4px)",
						},
						colors: {},
					},
				},
			},
		},
		cssVars: {
			light: {
				radius: "0.5rem",
			},
			dark: {},
		},
	} satisfies RegistryItemSchema;

	if (config.tailwind.cssVariables) {
		theme.tailwind.config.theme.extend.colors = {
			...theme.tailwind.config.theme.extend.colors,
			...buildTailwindThemeColorsFromCssVars(baseColor.cssVars.dark),
		};
		theme.cssVars = {
			light: {
				...baseColor.cssVars.light,
				...theme.cssVars.light,
			},
			dark: {
				...baseColor.cssVars.dark,
				...theme.cssVars.dark,
			},
		};
	}

	return theme;
}
