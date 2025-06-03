import type { ElementType } from "react";

/**
 * Represents a mapping of class names.
 */
export type Classes<T extends string = string> = { [K in T]: string };

/**
 * Represents a value that corresponds to a key in the `Classes` mapping.
 */
export type ClassValue<T extends Classes> = keyof T;

/**
 * Prop definitions for components that accept `className` or ignore it.
 */
export type ClassProp = { className?: never } | { className: string };

/**
 * Defines schema for class configuration variants.
 * Each variant maps its options to a class value.
 */
export type ClassConfigSchema<T extends Classes = any> = Record<string, Record<string, ClassValue<T>>>;

/**
 * Represents a mapping of flags to class values.
 */
export type ClassFlags<T extends Classes = any> = Record<string, ClassValue<T>>;

/**
 * Defines allowed values for variants and flags in a class configuration.
 */
export type ClassConfigVariants<T extends ClassConfigSchema, F extends ClassFlags> = {
	[Variant in keyof T]?: keyof T[Variant];
} & {
	[Flag in keyof F]?: boolean;
};

/**
 * Maps flag keys to specific class values.
 */
export type ClassFlagVariants<F extends ClassFlags, C extends Classes = Classes> = {
	[Flag in keyof F]?: ClassValue<C>;
};

/**
 * Full configuration for a class system, including base, variants, and flags.
 */
export type ClassConfig<C extends Classes, T extends ClassConfigSchema<C>, F extends ClassFlags<C>> = {
	base?: ClassValue<C>;
	variants?: T;
	flags?: F;
	defaultVariants?: ClassConfigVariants<T, F>;
};

/**
 * Props expected for a class-based component, including variants, flags, and `className`.
 */
export type ClassProps<T extends ClassConfigSchema, F extends ClassFlags> = ClassConfigVariants<T, F> & ClassProp;

/**
 * Filters that can be applied to class configurations, combining variants and flags.
 */
export type ClassFilters<T extends ClassConfigSchema, F extends ClassFlags> = {
	[Key in keyof F | keyof T]: Key extends keyof T ? keyof T[Key] | null : boolean;
};

/**
 * Define a type for the merge mode
 */
export type ClassMergeMode = "merge" | "combine" | "name-combine";

/**
 * Define a type for the theme mode
 */
export type ThemeMode = "light" | "dark" | "system";

/**
 * Define a type for the theme props type options for handler type
 */
export type ThemePropsTypeOptions<T extends object = object> = T & {
	as?: ElementType;
};

/**
 * Define a type for the theme props
 */
export type ThemePropsType<T extends object = object, Attr extends object = object> =
	| ((props: T, name: string, options: ThemePropsTypeOptions<Attr>) => T)
	| T;
