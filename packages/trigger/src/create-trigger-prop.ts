import type { TriggerProp } from "./types";

/**
 * Creates a trigger property object.
 * @template P
 * @param {TriggerProp<P>} prop - The trigger property.
 * @returns {{ name: string; props: P }} The formatted trigger property.
 */
const createTriggerProp = <P = any>(prop: TriggerProp<P>): { name: string; props: P } => {
	if (typeof prop === "string") {
		return { name: prop, props: {} as P };
	}
	if (Array.isArray(prop)) {
		const [name, props] = prop;
		return { name, props: props == null ? ({} as P) : props };
	}
	if ("props" in prop && prop.props != null) {
		return prop;
	}
	return { name: prop.name, props: {} as P };
};

export { createTriggerProp };
