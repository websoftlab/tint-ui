import { logger } from "./logger";

let isWarning = true;

/**
 * Checks if a condition is null, false, or NaN/non-finite for numbers.
 *
 * @param cond - The condition to check
 * @returns True if the condition is null, false, or NaN/non-finite for numbers
 */
function nonCond(cond: unknown) {
	return cond == null || cond === false || (typeof cond === "number" && (isNaN(cond) || !isFinite(cond)));
}

/**
 * Warns with a given message.
 *
 * @param message - The message to warn with.
 */
function warn(message: string) {
	logger.warn(message);

	try {
		// This error is thrown as a convenience so you can more easily
		// find the source for a warning that appears in the console by
		// enabling "pause on exceptions" in your JavaScript debugger.
		throw new Error(message);
		// eslint-disable-next-line no-empty
	} catch (e) {}
}

/**
 * Disables all warnings.
 */
const disableWarning = () => {
	isWarning = false;
};

/**
 * Throws an error if the condition is null, false, or NaN/non-finite for numbers.
 *
 * @param cond - The condition to check.
 * @param message - The message to throw.
 */
function invariant(cond: unknown, message: string): asserts cond {
	if (nonCond(cond)) throw new Error(message);
}

/**
 * Warns with a given message if the condition is null, false, or NaN/non-finite for numbers.
 *
 * @param cond - The condition to check.
 * @param message - The message to warn with.
 */
const warning = (cond: unknown, message: string): void => {
	if (!isWarning) {
		return;
	}
	if (nonCond(cond)) {
		warn(message);
	}
};

const alreadyWarned: Record<string, boolean> = Object.create(null);

/**
 * Warns once with a given message if the condition is null, false, or NaN/non-finite for numbers.
 *
 * @param key - The key to use for the warning.
 * @param cond - The condition to check.
 * @param message - The message to warn with.
 */
const warningOnce = (key: string, cond: boolean, message: string) => {
	if (!isWarning) {
		return;
	}
	if (alreadyWarned[key]) {
		return;
	}
	if (nonCond(cond)) {
		alreadyWarned[key] = true;
		warn(message);
	}
};

export { disableWarning, warningOnce, invariant, warning };
