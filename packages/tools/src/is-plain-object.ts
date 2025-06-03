/*!
 * Origin:
 * is-plain-object <https://github.com/jonschlinkert/is-plain-object>
 *
 * Copyright (c) 2014-2017, Jon Schlinkert.
 * Released under the MIT License.
 */

/**
 * Checks if the given value is an object and not null.
 *
 * @param {unknown} o - The value to check.
 * @returns {boolean} True if the value is an object, false otherwise.
 */
function isObject(o: unknown): o is object {
	return o != null && Object.prototype.toString.call(o) === "[object Object]";
}

/**
 * Checks if the given value is a plain object (i.e. created by {} or new Object()).
 * A plain object is an object that has either no constructor or a constructor that is Object.
 * It also must have Object.prototype in its prototype chain.
 *
 * @template Object - The type of the object to check (fake type, for type inference).
 * @param {unknown} o - The object to check.
 * @returns {boolean} True if the object is a plain object, false otherwise.
 */
function isPlainObject<Object extends {} = any>(o: unknown): o is Object {
	if (!isObject(o)) return false;

	// If has modified constructor
	let ctor = o.constructor;
	if (ctor === undefined) return true;

	// If has modified prototype
	let proto = ctor.prototype;
	if (!isObject(proto)) return false;

	// If constructor does not have an Object-specific method
	if (!proto.hasOwnProperty("isPrototypeOf")) return false;

	// Most likely a plain Object
	return true;
}

export { isObject, isPlainObject };
