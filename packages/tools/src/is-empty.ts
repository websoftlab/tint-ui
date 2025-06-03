const _isEmptyObject = (value: object) => {
	for (const key in value) {
		if (Object.prototype.hasOwnProperty.call(value, key)) {
			return false;
		}
	}
	return true;
};

/**
 * Checks if a value is empty.
 *
 * @param {unknown} value - The value to check.
 * @returns {boolean} True if the value is empty, false otherwise.
 */
const isEmpty = (value: unknown): boolean => {
	if (value == null || value === "") {
		return true;
	}
	if (Array.isArray(value)) {
		return value.length === 0;
	}
	if (value instanceof Date) {
		value = value.getTime();
	}
	switch (typeof value) {
		case "object":
			return _isEmptyObject(value as object);
		case "number":
			return isNaN(value) || !isFinite(value);
		case "boolean":
			return !value;
	}
	return false;
};

/**
 * Checks if a value is an empty object.
 *
 * @param {T | null | undefined} value - The value to check.
 * @returns {boolean} True if the value is an empty object, false otherwise.
 */
const isEmptyObject = <T extends object = object>(value: T | null | undefined): boolean => {
	if (value == null) {
		return true;
	}
	if (typeof value !== "object") {
		return false;
	}
	if (Array.isArray(value)) {
		return value.length === 0;
	}
	return _isEmptyObject(value);
};

/**
 * Checks if a value is an empty array.
 *
 * @param {T[] | null | undefined} value - The value to check.
 * @returns {boolean} True if the value is an empty array, false otherwise.
 */
const isEmptyArray = <T = unknown>(value: T[] | null | undefined): boolean => {
	return value == null || (Array.isArray(value) && value.length === 0);
};

/**
 * Checks if a value is an empty string.
 *
 * @param {string | null | undefined} value - The value to check.
 * @returns {boolean} True if the value is an empty string, false otherwise.
 */
const isEmptyString = (value: string | null | undefined): value is null | undefined => {
	return value == null || value === "";
};

/**
 * Checks if a value is an empty number.
 *
 * @param {number | null | undefined} value - The value to check.
 * @returns {boolean} True if the value is an empty number, false otherwise.
 */
const isEmptyNumber = (value: number | null | undefined): value is null | undefined => {
	return value == null || isNaN(value) || !isFinite(value);
};

export { isEmptyObject, isEmptyArray, isEmptyNumber, isEmptyString, isEmpty };
