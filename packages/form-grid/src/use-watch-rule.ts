"use client";

import type { UseFormGetValues } from "react-hook-form";
import type { FormGridThenRule } from "./types";

import * as React from "react";
import { useFormPrefix } from "@tint-ui/form-input-group";
import { useFormContext } from "react-hook-form";
import { getRuleNames, hasRule } from "./rule";

type NameMap = {
	hash: string;
	keys: string[];
	names: Record<string, string>;
};

type Ref = NameMap & {
	rule: FormGridThenRule;
	init: boolean;
	initial: boolean;
	onChange?: (value: boolean) => void;
};

const calculateValues = ({ keys, names }: NameMap, getValues: UseFormGetValues<any>) => {
	const data = getValues(keys);
	const result: Record<string, unknown> = {};
	for (let i = 0; i < keys.length; i++) {
		const key = keys[i];
		result[names[key]] = data[i];
	}
	return result;
};

const useWatchRule = (
	rule: FormGridThenRule,
	options: {
		onChange?: (value: boolean) => void;
		initial?: boolean;
	} = {}
) => {
	const { onChange, initial = false } = options;
	const ctx = useFormContext();

	const pref = useFormPrefix();
	const id = pref.path.length ? pref.path.join(".") : null;
	const nameMap = React.useMemo(() => {
		const names = getRuleNames(rule);
		const keys: string[] = [];
		const remap: Record<string, string> = {};
		for (const name of names) {
			const key = id == null ? name : `${id}.${name}`;
			keys.push(key);
			remap[key] = name;
		}
		return {
			hash: keys.join(":"),
			keys,
			names: remap,
		} as NameMap;
	}, [id, rule]);

	const { subscribe, setValue, getValues } = ctx;
	const [watchValue, setWatchValue] = React.useState(() => {
		return hasRule(rule, calculateValues(nameMap, getValues));
	});

	const { hash } = nameMap;
	const ref = React.useRef<Ref>({
		...nameMap,
		init: false,
		rule,
		onChange,
		initial,
	});

	Object.assign(ref.current, {
		keys: nameMap.keys,
		names: nameMap.names,
		rule,
		onChange,
		initial,
	});

	React.useEffect(() => {
		let prev = watchValue;
		let capture = false;
		let emitted = false;

		const onChange = (value: boolean) => {
			const { onChange } = ref.current;
			if (onChange) {
				onChange(value);
			}
		};

		const watch = () => {
			const { rule } = ref.current;
			const test = hasRule(rule, calculateValues(ref.current, getValues));
			if (prev === test) {
				return false;
			}
			prev = test;
			const data = test ? rule.showData : rule.hideData;
			if (data != null) {
				capture = true;
				for (const key in data) {
					setValue(key, data[key]);
				}
				capture = false;
			}
			setWatchValue(prev);
			onChange(prev);
			return true;
		};

		if (ref.current.hash !== hash) {
			ref.current.hash = hash;
			emitted = watch();
		}

		if (!emitted && ref.current.initial && !ref.current.init) {
			onChange(prev);
		}

		ref.current.init = true;
		return subscribe({
			formState: {
				values: true,
			},
			callback(data) {
				if (capture) {
					return;
				}
				const { name } = data;
				name && ref.current.keys.includes(name) && watch();
			},
		});
	}, [subscribe, setValue, getValues, hash]);

	return watchValue;
};

export { useWatchRule };
