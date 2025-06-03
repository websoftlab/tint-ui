import { logger } from "./logger";

let isInit = false;
let isBrowser = false;
let isLocalStorageSupport = false;

/**
 * Initializes the environment checks only once.
 */
const init = () => {
	if (isInit) {
		return;
	}

	isInit = true;

	// Check if running in a browser
	isBrowser = typeof window !== "undefined" && typeof document !== "undefined";

	// Check if localStorage is supported
	isLocalStorageSupport = (() => {
		if (!isBrowser || !window.localStorage) {
			return false;
		}
		try {
			const key = `test_${Math.random().toString(36).slice(2)}`;
			localStorage.setItem(key, "1");
			const value = localStorage.getItem(key);
			localStorage.removeItem(key);
			return value === "1" && localStorage.getItem(key) === null;
		} catch (err) {
			logger.warn("Local storage is not supported", err);
			return false;
		}
	})();
};

/**
 * Checks if the current environment is a browser.
 *
 * @returns {boolean} True if running in a browser, false otherwise.
 */
const isBrowserEnvironment = (): boolean => {
	init();
	return isBrowser;
};

/**
 * Checks if the localStorage is supported in the current environment.
 *
 * @returns {boolean} True if localStorage is supported, false otherwise.
 */
const isLocalStorage = (): boolean => {
	init();
	return isLocalStorageSupport;
};

export { isBrowserEnvironment, isLocalStorage };
