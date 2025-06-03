import { isPlainObject } from "./is-plain-object";

/**
 * Options for cloning an object.
 */
interface CloneObjectOptions {
	/**
	 * A function that will be called if the object is not supported.
	 *
	 * @param object - The object that is not supported.
	 * @returns The cloned object.
	 */
	unknown?: (object: unknown) => any;

	/**
	 * Whether to throw an error if the object is not supported. Default is true.
	 */
	throwable?: boolean;
}

function cloneArray<T>(obj: T[], options: CloneObjectOptions): T[] {
	const copy: T[] = [];
	for (let i = 0, len = obj.length; i < len; i++) {
		copy[i] = cloneObject(obj[i], options);
	}
	return copy;
}

function cloneObject<T = any>(obj: T, options: CloneObjectOptions): T {
	// Handle null or undefined
	if (null == obj) {
		return obj;
	}

	// 3 simple types, symbol and BigInt
	const tof = typeof obj;
	if (tof === "number" || tof === "string" || tof === "boolean" || tof === "symbol") {
		return obj;
	}
	if (tof === "bigint") {
		return BigInt(obj.toString()) as T;
	}

	// Handle Array
	if (Array.isArray(obj)) {
		return cloneArray(obj, options) as T;
	}

	let copy: any;

	// Handle Date
	if (obj instanceof Date) {
		copy = new Date();
		copy.setTime(obj.getTime());
		return copy;
	}

	// Handle Object
	if (isPlainObject(obj)) {
		const nullable = obj.constructor === undefined;
		copy = Object.create(nullable ? null : {});
		for (let name in obj) {
			if (nullable || (obj as Object).hasOwnProperty(name)) {
				copy[name] = cloneObject(obj[name], options);
			}
		}
		return copy;
	}

	const { throwable = true, unknown } = options;
	if (typeof unknown === "function") {
		return unknown(obj);
	}

	if (throwable) {
		throw new Error("Unable to copy obj! Its type isn't supported.");
	}

	return obj;
}

/**
 * Clones a plain array.
 * If the object is not array, it will throw an error.
 *
 * @param obj - The array to clone.
 * @param options - The options to use.
 * @returns The cloned array.
 */
function clonePlainArray<T = any>(obj: T[], options: CloneObjectOptions = {}): T[] {
	if (Array.isArray(obj)) {
		return cloneArray(obj, options);
	}
	throw new Error("Unable to copy obj! Object must be array.");
}

/**
 * Clones a plain object.
 * If the object is not a plain object, it will throw an error.
 *
 * Handles the following data types:
 * - Primitive types (numbers, strings, booleans, null, symbol)
 * - Date objects
 * - BigInt values
 * - Arrays
 * - Plain objects
 *
 * @param obj - The object to clone.
 * @param options - The options to use.
 * @returns The cloned object.
 */
function clonePlainObject<T extends {} = any>(obj: T, options: CloneObjectOptions = {}): T {
	if (isPlainObject(obj)) {
		return cloneObject(obj, options);
	}
	throw new Error("Unable to copy obj! Object must be plain.");
}

export { clonePlainObject, clonePlainArray };
export type { CloneObjectOptions };
