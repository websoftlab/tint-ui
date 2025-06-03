import { noop } from "./noop";
import { isBrowserEnvironment } from "./browser-support";

/**
 * Adds a listener to the global page resize event with a 200ms debounce delay to prevent
 * excessive recalculations. Also handles orientation change events without delay.
 *
 * @example
 * ```tsx
 * const cleanup = resizePage(() => {
 *   console.log("Page resized");
 * });
 *
 * // Cleanup the event listener (for useEffect recommended)
 * cleanup();
 * ```
 *
 * @param {() => void} cb - The callback function to execute when page is resized or orientation changes.
 * @param {boolean} tick - Whether to execute the callback immediately.
 * @param {number | null} delay - The delay in milliseconds to debounce the resize event.
 * @returns {() => void} A cleanup function that removes the resize and orientation change event listeners.
 */
export function resizePage(cb: () => void, tick: boolean = false, delay: number | null = 200): () => void {
	if (!isBrowserEnvironment() || typeof cb !== "function") {
		return noop;
	}
	// Prevent passing event object as first argument
	const handleResize = () => {
		cb();
	};
	let id: number | null = null;
	const reset = () => {
		if (id) {
			window.clearTimeout(id);
			id = null;
		}
	};
	const timeout = (time: number = 0) => {
		id = window.setTimeout(() => {
			id = null;
			cb();
		}, time);
	};
	const resize =
		delay == null || delay <= 0
			? handleResize
			: () => {
					reset();
					timeout(delay);
			  };
	window.addEventListener("resize", resize, false);
	window.addEventListener("orientationchange", handleResize, false);
	if (tick) {
		timeout();
	}
	return () => {
		window.removeEventListener("resize", resize, false);
		window.removeEventListener("orientationchange", handleResize, false);
		reset();
	};
}
