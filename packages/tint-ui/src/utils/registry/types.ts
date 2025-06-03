// registry types

export interface RegistryIconSchema {
	name: string;
	type: "filled" | "outline";
	data: (string | [string, any])[];
}

export interface RegistryOptionSchema {
	name: string;
	label: string;
}

export interface RegistryItemTailwindSchema {
	config?: {
		content?: string[];
		theme?: Record<string, any>;
		plugins?: string[];
	};
}

export interface RegistryItemCssVarsSchema {
	light?: Record<string, string>;
	dark?: Record<string, string>;
}

export interface RegistryItemSchema {
	name: string;
	module: string;
	withStyles?: boolean;
	description?: string;
	dependencies?: string[];
	registryDependencies?: string[];
	tailwind?: RegistryItemTailwindSchema;
	cssVars?: RegistryItemCssVarsSchema;
	icons?: string[];
	meta?: Record<string, any>;
	docs?: string;
}

export interface RegistryColors {
	light: Record<string, string>;
	dark: Record<string, string>;
}

export interface RegistryBaseColorSchema {
	inlineColors: RegistryColors;
	cssVars: RegistryColors;
	inlineColorsTemplate: string;
	cssVarsTemplate: string;
}

export type RegistryResolvedItemsTreeSchema = Pick<
	RegistryItemSchema,
	"dependencies" | "tailwind" | "cssVars" | "icons" | "docs"
> & {
	components: {
		name: string;
		module: string;
		withStyles?: boolean;
	}[];
};
