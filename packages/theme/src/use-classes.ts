import type { Classes, ClassMergeMode } from "./types";

import { useTheme } from "./use-theme";

// Type definition for caching updated classes
type CacheClasses<T extends Classes = Classes> = { classes: T; mode: ClassMergeMode };

// WeakMap for caching updated classes
const merges = new WeakMap<Record<string, string>, CacheClasses>();

/**
 * Merges classes based on the specified mode.
 *
 * @param defaultClasses - Default classes.
 * @param classes - Theme classes to merge.
 * @param mode - Merge mode: "merge", "combine", or "name-combine".
 * @returns The updated class object.
 */
const mergeClasses = function <T extends Classes>(defaultClasses: T, classes: Partial<T>, mode: ClassMergeMode) {
	const result = {} as { [K in keyof T]: string };
	const combine = mode === "combine";
	const nameCombine = mode === "name-combine";

	// Process each key in defaultClasses
	(Object.keys(defaultClasses) as (keyof T)[]).forEach((name) => {
		const value = classes[name];

		if (value == null || value === "") {
			// If the theme value is missing, use the default value
			result[name] = defaultClasses[name];
		} else if (combine) {
			// Combine default and theme values
			result[name] = `${defaultClasses[name]} ${value}`;
		} else if (nameCombine) {
			// Add the key name to the theme value
			result[name] = `${name as string} ${value}`;
		} else {
			// Use the theme value
			result[name] = value;
		}
	});
	return result;
};

/**
 * Hook to retrieve classes based on the current theme.
 *
 * @param name - The name of the class group.
 * @param defaultClasses - Default classes.
 * @returns The updated class object.
 */
export const useClasses = function <C extends Classes>(name: string, defaultClasses: C): C {
	const theme = useTheme();
	const themeClasses = theme.getClasses(name);
	if (!themeClasses) {
		// If the theme does not have the specified class group, return defaultClasses
		return defaultClasses;
	}

	const { classesMode } = theme;
	const cache = merges.get(themeClasses) as CacheClasses<C> | undefined;

	// Update classes if there is no cache or the mode has changed
	if (!cache || cache.mode !== classesMode) {
		const classesUpdate = mergeClasses(defaultClasses, themeClasses as Partial<C>, classesMode);
		merges.set(themeClasses, { mode: classesMode, classes: classesUpdate });
		return classesUpdate as C;
	}

	return cache.classes;
};
