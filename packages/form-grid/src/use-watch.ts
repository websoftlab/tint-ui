"use client";

import * as React from "react";
import { useFormPrefix } from "@tint-ui/form-input-group";
import { useFormContext } from "react-hook-form";

type Ref<T, R> = {
	name: string;
	path: (string | number)[];
	data: T;
	initial: boolean;
	handler(value: unknown, data: T): R;
	compare?: (prev: R, next: R) => boolean;
	onChangeValue?: (value: R) => void;
};

const refCompare = <T, R>(ref: Ref<T, R>, prev: R, next: R) => {
	if (ref.compare) {
		return ref.compare(prev, next);
	}
	return Object.is(prev, next);
};

const useWatch = <T, R>(
	name: string,
	data: T,
	handler: (value: unknown, data: T) => R,
	options: {
		compare?: (prev: R, next: R) => boolean;
		onChangeValue?: (value: R) => void;
		initial?: boolean;
	} = {}
) => {
	const { compare, onChangeValue, initial = false } = options;
	const ctx = useFormContext();
	const pref = useFormPrefix();
	const path = [...pref.path, name];
	const fullName = path.length > 1 ? path.join(".") : name;
	const ref = React.useRef<Ref<T, R>>({ name: fullName, path, handler, compare, onChangeValue, data, initial });

	const [watchValue, setWatchValue] = React.useState<R>(() => {
		return handler(ctx.getValues(fullName), data);
	});

	Object.assign(ref.current, {
		path,
		handler,
		compare,
		onChangeValue,
		data,
		initial,
	});

	const { subscribe, getValues } = ctx;
	React.useEffect(() => {
		let prev = watchValue;
		const onChange = (value: R) => {
			const { onChangeValue } = ref.current;
			if (onChangeValue) {
				onChangeValue(value);
			}
		};
		const watch = (next: R) => {
			if (!refCompare(ref.current, prev, next)) {
				prev = next;
				setWatchValue(prev);
				onChange(prev);
				return true;
			}
			return false;
		};
		let emitted = false;
		if (ref.current.name !== fullName) {
			ref.current.name = fullName;
			emitted = watch(ref.current.handler(getValues(fullName), ref.current.data));
		}
		if (!emitted && ref.current.initial) {
			onChange(prev);
		}
		return subscribe({
			formState: {
				values: true,
			},
			callback(data) {
				if (data.name !== ref.current.name) {
					return;
				}
				const value = ref.current.path.reduce(
					(prev, current) => (prev == null ? null : prev[current]),
					data.values
				);
				watch(ref.current.handler(value, ref.current.data));
			},
		});
	}, [subscribe, getValues, fullName]);

	return watchValue;
};

export { useWatch };
