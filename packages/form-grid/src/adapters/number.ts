import type { InputNumberAdapterProps } from "@tint-ui/input";
import type { FormGridFieldType, AddFormFieldAdapter, AddFormFieldAdapterOptions } from "../types";

import { z } from "zod";
import { inputNumberAdapter } from "@tint-ui/input";

type NumberAdapterConfig = Pick<
	InputNumberAdapterProps,
	| "min"
	| "max"
	| "step"
	| "ctrlStep"
	| "onFormatValue"
	| "onChangeValue"
	| "onChangeOptions"
	| "size"
	| "autoFocus"
	| "autoComplete"
	| "autoCorrect"
	| "tabIndex"
	| "form"
>;

const numberAdapter: AddFormFieldAdapter = (field: FormGridFieldType) => {
	const { readOnly } = field;
	const {
		onFormatValue,
		onChangeValue,
		onChangeOptions,
		size,
		min,
		max,
		step,
		ctrlStep,
		autoCorrect,
		autoFocus,
		autoComplete,
		tabIndex,
		form,
	} = (field.config || {}) as NumberAdapterConfig;
	return inputNumberAdapter({
		placeholder: field.placeholder || undefined,
		onFormatValue,
		onChangeValue,
		onChangeOptions,
		size,
		min,
		max,
		step,
		ctrlStep,
		readOnly,
		autoCorrect,
		autoFocus,
		autoComplete,
		tabIndex,
		form,
	});
};

const numberAdapterOptions: AddFormFieldAdapterOptions = {
	createZodSchema(field) {
		const { min, max } = (field.config || {}) as NumberAdapterConfig;
		let schema = z.number();
		if (min != null) {
			schema = schema.min(min);
		}
		if (max != null) {
			schema = schema.max(max);
		}
		return z.preprocess((value) => {
			if (typeof value === "string") {
				const test = parseInt(value);
				return Number.isFinite(test) ? test : null;
			}
			if (typeof value === "number") {
				return Number.isFinite(value) ? value : null;
			}
			return value === undefined ? null : value;
		}, schema);
	},
};

export { numberAdapter, numberAdapterOptions };
export type { NumberAdapterConfig };
