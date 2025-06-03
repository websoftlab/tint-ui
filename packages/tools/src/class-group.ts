/**
 * Represents a class group.
 *
 * @property {string} base - The base class name.
 * @property {(name: string) => string} a - Returns class names for child elements.
 * @property {(name: string, suffix?: string) => string} b - Returns base class name with a modifier.
 */
type ClassGroup = {
	/**
	 * The base class name.
	 */
	readonly base: string;
	/**
	 * Returns class names for child elements.
	 *
	 * @param {string} name - The name of the child element.
	 * @returns {string} The class name for the child element.
	 */
	a(name: string): string;
	/**
	 * Returns base class name with a modifier.
	 *
	 * @param {string} name - The name of the modifier.
	 * @param {string | null |undefined} suffix - The suffix of the modifier.
	 * @returns {string} The class name for the modifier.
	 */
	b(name: string, suffix?: string): string;
};

/**
 * Creates an object for generating class name strings, where:
 * - base: returns the base class name
 * - a: function that returns class names for child elements
 * - b: function that returns base class name with a modifier
 *
 * @param {string} name - The name of the class group.
 * @returns {ClassGroup} The class group object.
 */
const classGroup = (name: string): ClassGroup => {
	const prefix = `tui-${name}`;
	return {
		get base() {
			return prefix;
		},
		a(name: string) {
			return `${prefix}--${name}`;
		},
		b(name: string, suffix?: string | null) {
			name = `${prefix}_${name}`;
			if (suffix) {
				name += `--${suffix}`;
			}
			return name;
		},
	};
};

export { classGroup };
export type { ClassGroup };
