import { noop } from "./noop";
import { isBrowserEnvironment } from "./browser-support";

/**
 * Adds a listener to the global page scroll event.
 *
 * @example
 * ```tsx
 * const cleanup = scrollPage(() => {
 *   console.log("Page scrolled");
 * });
 *
 * // Cleanup the event listener (for useEffect recommended)
 * cleanup();
 * ```
 * @param {() => void} cb - The callback function to execute when page is scrolled.
 * @param {boolean} tick - Whether to execute the callback immediately.
 * @returns {() => void} A cleanup function that removes the scroll event listener.
 */
export const scrollPage = (cb: () => void, tick: boolean = false): (() => void) => {
	if (!isBrowserEnvironment() || typeof cb !== "function") {
		return noop;
	}
	// Prevent passing event object as first argument
	const handleScroll = () => {
		cb();
	};
	window.addEventListener("scroll", handleScroll, false);
	if (tick) {
		setTimeout(handleScroll);
	}
	return () => {
		window.removeEventListener("scroll", handleScroll, false);
	};
};
