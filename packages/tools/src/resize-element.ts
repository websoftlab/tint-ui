import { noop } from "./noop";
import { resizePage } from "./resize-page";
import { isBrowserEnvironment } from "./browser-support";

/**
 * Represents the size of an element.
 *
 * @property {number} width - The width of the element.
 * @property {number} height - The height of the element.
 */
type Size = {
	width: number;
	height: number;
};

/**
 * Represents a callback function that receives the size of an element.
 *
 * @param {Size} calc - The calculated size of the element.
 */
type SizeCallback = (calc: Size) => void;

/**
 * Represents the method to calculate the size of an element.
 *
 * @property {SizeCalculateMethod} method - The method to calculate the size of the element.
 * @property {boolean} initialEmit - Whether to execute the callback immediately.
 */
type SizeCalculateMethod = "border" | "content" | "offset";

/**
 * Represents the options for the resizeElement function.
 */
type ResizeElementOptions = {
	/**
	 * The method to calculate the size of the element.
	 */
	method?: SizeCalculateMethod;
	/**
	 * Whether to execute the callback immediately.
	 */
	initialEmit?: boolean;
	/**
	 * The delay in milliseconds to debounce the resize event for fallback to page resize.
	 */
	delay?: number | null;
};

const getSize = (element: HTMLElement): Size => {
	return {
		width: element.offsetWidth,
		height: element.offsetHeight,
	};
};

const getSizeByMethod = (variant: readonly ResizeObserverSize[] | undefined | null): Size | null => {
	if (variant && variant[0]) {
		return {
			width: variant[0].inlineSize,
			height: variant[0].blockSize,
		};
	}
	return null;
};

/**
 * Adds a listener to the element resize event.
 *
 * @param {HTMLElement} element - The element to listen to.
 * @param {() => void} cb - The callback function to execute when the element is resized.
 * @param {ResizeElementOptions} options - The options for the resizeElement function.
 * @returns {() => void} A cleanup function that removes the resize event listener.
 */
const resizeElement = (
	element: HTMLElement,
	cb: SizeCallback,
	{ method = "border", initialEmit = false, delay = 200 }: ResizeElementOptions = {}
): (() => void) => {
	if (!isBrowserEnvironment()) {
		return noop;
	}

	if (initialEmit) {
		cb(getSize(element));
	}

	// Fallback to page resize if ResizeObserver is not supported
	if (typeof ResizeObserver === "undefined") {
		let size = getSize(element);
		return resizePage(
			() => {
				const calc = getSize(element);
				if (calc.width !== size.width || calc.height !== calc.height) {
					size = calc;
					cb(calc);
				}
			},
			false,
			delay
		);
	}

	const resizeObserver = new ResizeObserver((entries) => {
		if (method === "offset") {
			cb(getSize(element));
		} else {
			for (const entry of entries) {
				if (entry.target !== element) {
					continue;
				}
				const { borderBoxSize, contentBoxSize } = entry;
				const size = getSizeByMethod(method === "border" ? borderBoxSize : contentBoxSize);
				if (size) {
					cb(size);
				}
				break;
			}
		}
	});

	resizeObserver.observe(element);
	return () => {
		resizeObserver.unobserve(element);
		resizeObserver.disconnect();
	};
};

export { resizeElement };
export type { Size, SizeCallback, SizeCalculateMethod, ResizeElementOptions };
