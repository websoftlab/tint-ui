import type { ElementType } from "react";

const df = <T extends {}, U>(target: T, source: U | string, value?: unknown): T & U => {
	if (typeof source === "string") {
		target[source as keyof T] = value as never;
	} else {
		Object.assign(target, source);
	}
	return target as T & U;
};

/**
 * Options for the asProps function.
 *
 * @template P - Component props
 */
type AsPropsOptions<P extends { as?: ElementType | undefined; htmlAs?: string | undefined }> = {
	/**
	 * Default element type to render if not specified in props
	 */
	as?: ElementType;
	/**
	 * Function to dynamically determine element type based on props
	 */
	asFn?: (p: P) => ElementType;
};

/**
 * Processes component props to handle the 'as' prop pattern for polymorphic component
 *
 * @template P - Component props
 *
 * @param {P} props - Component props including optional 'as' and 'htmlAs' props
 * @param {AsPropsOptions<P>} options - Configuration options for component rendering
 * @returns {[ElementType, Omit<P, "as" | "htmlAs"> & { as?: string }]} Tuple containing [ElementType, remaining props]
 */
function asProps<P extends { as?: ElementType | undefined; htmlAs?: string | undefined }>(
	props: P,
	options: AsPropsOptions<P> = {}
): [ElementType, Omit<P, "as" | "htmlAs"> & { as?: string }] {
	const { as, htmlAs, ...rest } = props;
	let As = as;
	if (!As) {
		const { as = "div", asFn } = options;
		As = typeof asFn === "function" ? asFn(props) : as;
	}
	if (htmlAs != null) {
		df(rest, typeof As === "string" ? "as" : "htmlAs", htmlAs);
	}
	return [As, rest];
}

export { asProps };
export type { AsPropsOptions };
