const firstLower = (value: string) => value.charAt(0).toLowerCase();

const ignoreFirst = (value: string) => value.substring(1);

const upperTo = (value: string, variant: string): string =>
	firstLower(value) + ignoreFirst(value).replace(/([A-Z])/g, (_, t: string) => `${variant}${t.toLowerCase()}`);

/**
 * Converts a string to camel case.
 *
 * @param {string} value - The string to convert.
 * @returns {string} The camel case string.
 */
const toCamel = (value: string): string =>
	value.charAt(0).toUpperCase() + ignoreFirst(value).replace(/-([a-z])/g, (_, t: string) => t.toUpperCase());

/**
 * Converts a string to lower camel case.
 *
 * @param {string} value - The string to convert.
 * @returns {string} The lower camel case string.
 */
const toLowerCamel = (value: string): string =>
	firstLower(value) + ignoreFirst(value).replace(/-([a-z])/g, (_, t: string) => t.toUpperCase());

/**
 * Converts a string to kebab case.
 *
 * @param {string} value - The string to convert.
 * @returns {string} The kebab case string.
 */
const toKebab = (value: string): string => upperTo(value, "-");

/**
 * Converts a string to snake case.
 *
 * @param {string} value - The string to convert.
 * @returns {string} The snake case string.
 */
const toSnake = (value: string): string => upperTo(value, "_");

/**
 * Converts a string to title case.
 *
 * @param {string} value - The string to convert.
 * @returns {string} The title case string.
 */
const toTitle = (value: string): string => value.replace(/\b\w/g, (c) => c.toUpperCase());

export { toCamel, toLowerCamel, toKebab, toSnake, toTitle };
