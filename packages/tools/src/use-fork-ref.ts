import type { MutableRefObject, Ref } from "react";
import * as React from "react";

/**
 * Sets a value to a ref.
 *
 * @template Value - The type of the value to set.
 * @param {Ref<Value> | null | undefined} ref - The ref to set the value to.
 * @param {Value} value - The value to set.
 */
export function setRef<Value>(ref: Ref<Value> | null | undefined, value: Value) {
	if (ref != null) {
		if (typeof ref === "function") {
			ref(value);
		} else {
			(ref as MutableRefObject<Value>).current = value;
		}
	}
}

/**
 * Creates a new function that sets a value to two refs.
 *
 * @template T - The type of the value to set.
 * @param {...Ref<T>[]} refs - The refs to set the value to.
 * @returns {Ref<T>} A new function that sets the value to the two refs.
 */
export function useForkRef<T = any>(...refs: Ref<T>[]): Ref<T> {
	/**
	 * This will create a new function if the ref props change and are defined.
	 * This means react will call the old forkRef with `null` and the new forkRef
	 * with the ref. Cleanup naturally emerges from this behavior
	 */
	return React.useMemo(
		() => (refValue: T) => {
			for (const refB of refs) {
				setRef(refB, refValue);
			}
		},
		refs
	);
}
