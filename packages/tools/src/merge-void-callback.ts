type Func<Args extends any[] = any[]> = (...args: Args) => void;

type FuncAsync<Args extends any[] = any[]> = (...args: Args) => void | Promise<void>;

/**
 * Merges multiple void callback functions into a single callback function.
 *
 * @param {...Func<Args>[]} func - The callback functions to merge.
 * @returns {Func<Args>} A single callback function that calls all the input functions.
 */
function mergeVoidCallback<Args extends any[]>(...func: (Func<Args> | undefined | null)[]): Func<Args> {
	const filter: Func<Args>[] = [];
	func.forEach((fn) => {
		if (fn != null) {
			filter.push(fn);
		}
	});
	return (...args: Args) => {
		for (const fn of filter) {
			fn(...args);
		}
	};
}

/**
 * Merges multiple async void callback functions into a single callback function.
 *
 * @param {...FuncAsync<Args>[]} func - The callback functions to merge.
 * @returns {FuncAsync<Args>} A single callback function that calls all the input functions.
 */
function mergeVoidCallbackAsync<Args extends any[]>(...func: (FuncAsync<Args> | undefined | null)[]): FuncAsync<Args> {
	const filter: FuncAsync<Args>[] = [];
	func.forEach((fn) => {
		if (fn != null) {
			filter.push(fn);
		}
	});
	return async (...args: Args) => {
		for (const fn of filter) {
			await fn(...args);
		}
	};
}

export { mergeVoidCallback, mergeVoidCallbackAsync };
