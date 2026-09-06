import type { Config } from "../get-config";
import type {
	RegistryIconSchema,
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
import { loadPackageFile } from "../load-package-file";

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

export function getRegistryIcons(
	baseIcons?: string[],
	iconsData?: RegistryIconSchema[] | undefined | null
): RegistryIconSchema[] {
	if (!baseIcons) {
		return icons.slice();
	}
	const found = new Set<string>();
	const filter = icons.filter((item) => {
		if (baseIcons.includes(item.name)) {
			found.add(item.name);
			return true;
		}
		return false;
	});
	if (Array.isArray(iconsData) && iconsData.length > 0) {
		for (const icon of iconsData) {
			if (!found.has(icon.name) && baseIcons.includes(icon.name)) {
				filter.push(icon);
			}
		}
	}
	return filter;
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

export async function registryResolveItemsTree(names: string[], config: Config, initialize = false) {
	let registryDependencies: string[] = [];
	for (const name of names) {
		const itemRegistryDependencies = await resolveRegistryDependencies(name);
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
	const iconsData: RegistryIconSchema[] = [];
	const iconsDataNames = new Set<string>();

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
		if (Array.isArray(item.iconsData)) {
			for (const icon of item.iconsData) {
				if (icon.name && !iconsDataNames.has(icon.name)) {
					iconsDataNames.add(icon.name);
					iconsData.push(icon);
				}
			}
		}
	});

	return {
		components: payload.map((item) => ({
			name: item.name,
			module: item.module,
			withStyles: item.withStyles,
			styles: item.styles,
		})),
		dependencies,
		tailwind,
		cssVars,
		icons,
		iconsData,
		docs,
	} as RegistryResolvedItemsTreeSchema;
}

async function readNpm(name: string) {
	if (name.startsWith("npm:")) {
		name = name.substring(4);
	}
	let data: RegistryItemSchema;
	try {
		const text = await loadPackageFile(`${name}/tint-ui.json`);
		data = JSON.parse(text);
	} catch (err) {
		logger.log("\n");
		handleError(
			new Error(
				`The component at ${highlighter.info(name)} was not found.\nOr ${highlighter.info(
					"tint-ui.json"
				)} file is not exists.`
			)
		);
	}

	if (!data.name) {
		const testSplit = name.match(/\/(.+?)$/);
		data.name = testSplit ? testSplit[1] : name;
	}

	const duplicate = components.find((item) => item.name === data.name);
	if (duplicate && duplicate.module !== name) {
		logger.log("\n");
		handleError(
			new Error(
				`Duplicate local component name ${highlighter.info(data.name)} for the ${highlighter.info(
					name
				)} -> ${highlighter.info(duplicate.module)} package.`
			)
		);
	}

	if (!data.module) {
		data.module = name;
	}

	if (data.withStyles && (!Array.isArray(data.styles) || data.styles.length === 0)) {
		data.styles = [{ template: `${data.name}.module.scss`, name: "styles", classes: "classes" }];
	}

	return data;
}

async function resolveRegistryDependencies(name: string): Promise<string[]> {
	const payload: string[] = [];

	async function resolveDependencies(localName: string, tree: string[] = []) {
		const isNpm = localName.startsWith("npm:");
		let component = components.find((item) =>
			isNpm ? item.module === localName.substring(4) : item.name === localName
		);

		if (!component) {
			if (isNpm) {
				component = await readNpm(localName);
				components.push(component);
			} else {
				return console.error(`The ${localName} component not found`);
			}
		}

		if (tree.includes(localName)) {
			return;
		}

		tree.push(localName);
		if (component.registryDependencies) {
			for (const dependency of component.registryDependencies) {
				await resolveDependencies(dependency, tree);
			}
		}

		payload.push(localName);
	}

	await resolveDependencies(name);
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
