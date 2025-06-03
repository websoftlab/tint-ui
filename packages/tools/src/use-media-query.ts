"use client";

import { isBrowserEnvironment } from "./browser-support";
import * as React from "react";

/**
 * Options for the useMediaQuery hook.
 */
type UseMediaQueryOptions = {
	/**
	 * The default value of the media query.
	 */
	defaultMatches?: boolean;
	/**
	 * Whether to skip server-side rendering.
	 */
	noSsr?: boolean;
};

const getMatches = (query: string, defaultMatches: boolean): boolean => {
	if (!isBrowserEnvironment()) {
		return defaultMatches;
	}
	return window.matchMedia(query).matches;
};

/**
 * Hook to track media query matches.
 *
 * @example
 * ```tsx
 * const isMobile = useMediaQuery("(max-width: 768px)");
 *
 * if (isMobile) {
 *   return <div>Mobile</div>;
 * }
 *
 * return <div>Desktop</div>;
 * ```
 *
 * @param {string} query - The media query to track.
 * @param {UseMediaQueryOptions} options - The options for the hook.
 * @returns {boolean} The current state of the media query.
 */
function useMediaQuery(query: string, { defaultMatches = false, noSsr = true }: UseMediaQueryOptions = {}): boolean {
	const [matches, setMatches] = React.useState<boolean>(() => {
		if (noSsr) {
			return getMatches(query, defaultMatches);
		}
		return defaultMatches;
	});

	React.useLayoutEffect(() => {
		const matchMedia = window.matchMedia(query);

		// Handles the change event of the media query.
		function handleChange() {
			setMatches(getMatches(query, defaultMatches));
		}

		// Triggered at the first client-side load and if query changes
		handleChange();

		// Use deprecated `addListener` and `removeListener` to support Safari < 14 (#135)
		if (matchMedia.addListener) {
			matchMedia.addListener(handleChange);
		} else {
			matchMedia.addEventListener("change", handleChange);
		}

		return () => {
			if (matchMedia.removeListener) {
				matchMedia.removeListener(handleChange);
			} else {
				matchMedia.removeEventListener("change", handleChange);
			}
		};
	}, [query, defaultMatches]);

	return matches;
}

export { useMediaQuery };
export type { UseMediaQueryOptions };
