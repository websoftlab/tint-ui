import type {
	ClassConfig,
	ClassConfigSchema,
	ClassConfigVariants,
	Classes,
	ClassFilters,
	ClassFlags,
	ClassFlagVariants,
	ClassProps,
} from "./types";

import { useClasses } from "./use-classes";

// Extracts a property from the given object, removes it, and provides a default value if not found.
const extractProp = <T, K extends keyof T>(props: T, key: K, defaultValue?: T[K]): T[K] | null => {
	const result = props[key];
	delete props[key];
	if (result != null) {
		return result;
	}
	if (defaultValue != null) {
		return defaultValue;
	}
	return null;
};

// Checks if the given class name is valid based on the provided boolean map.
const isValidClass = <C extends string>(
	classBoolean: { [key in C]: boolean | undefined },
	name: unknown
): name is C => {
	return name != null && classBoolean[name as C] === true;
};

/**
 * Creates a filter for managing class names with variants and flags.
 *
 * @param name - The name of the class group.
 * @param classes - The class object containing default class mappings.
 * @param schema - The schema defining the base, variants, and flags for the class group.
 * @returns A function that provides the merged classes and a filterProps function.
 */
const createClassNameVariantFilter = <C extends Classes, T extends ClassConfigSchema<C>, F extends ClassFlags<C>>(
	name: string,
	classes: C,
	schema: ClassConfig<C, T, F>
) => {
	const {
		base,
		variants = {} as T,
		defaultVariants = {} as ClassConfigVariants<T, F>,
		flags = {} as ClassFlagVariants<F>,
	} = schema;

	const variantKeys = Object.keys(variants) as (keyof T)[];
	const flagKeys = Object.keys(flags) as (keyof F)[];
	const classBoolean = {} as { [key in keyof C]: boolean };

	// Initialize a boolean map for all classes
	for (const key in classes) {
		classBoolean[key] = classes[key] != null;
	}

	/**
	 * Filters the given props to extract class names, remaining props, and applied filters.
	 *
	 * @param classes - The class object containing merged class mappings.
	 * @param props - The properties to process.
	 * @returns An object containing the class name, remaining props, and applied filters.
	 */
	const filter = <P extends ClassProps<T, F>>(
		classes: C,
		props: P
	): {
		className: string | undefined;
		props: Omit<P, keyof T | keyof F | "className">;
		filters: ClassFilters<T, F>;
	} => {
		const rest = { ...props };
		const classList: string[] = [];
		const filters: any = {};

		// Add base class if valid
		if (isValidClass(classBoolean, base)) {
			classList.push(classes[base]);
		}

		// Extract and add the className prop
		const className = extractProp(rest, "className");
		if (className) {
			classList.push(className);
		}

		// Process variant keys
		for (const key of variantKeys) {
			const val = extractProp(rest, key, defaultVariants[key]);
			filters[key] = null;
			if (val != null) {
				const name = variants[key][val];
				if (isValidClass(classBoolean, name)) {
					filters[key] = val;
					classList.push(classes[name]);
				}
			}
		}

		// Process flag keys
		for (const key of flagKeys) {
			const name = flags[key];
			const test = extractProp(rest, key, defaultVariants[key]) === true;
			filters[key] = test;
			if (test && isValidClass(classBoolean, name)) {
				classList.push(classes[name]);
			}
		}

		return {
			className: classList.length ? classList.join(" ") : undefined,
			props: rest,
			filters,
		};
	};

	return (): {
		classes: C;
		filterProps: <P extends ClassProps<T, F>>(
			props: P
		) => {
			className: string | undefined;
			props: Omit<P, keyof T | keyof F | "className">;
			filters: ClassFilters<T, F>;
		};
	} => {
		// Retrieve merged classes based on the current theme
		const mergeClasses = useClasses(name, classes) as C;
		return {
			classes: mergeClasses,
			filterProps(props) {
				return filter(mergeClasses, props);
			},
		};
	};
};

export { createClassNameVariantFilter };
