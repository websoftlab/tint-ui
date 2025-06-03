import type { FormGridFieldType, AddFormFieldAdapter, AddFormFieldAdapterOptions } from "../types";

import { z } from "zod";
import { inputNumberAdapter } from "@tint-ui/input";

type NumberAdapterConfig = {
	min?: number;
	max?: number;
	step?: number;
	shiftStep?: number;
	onFormatValue?: (value: number) => number;
	onChangeValue?: (value: number | null) => void;
};

const numberAdapter: AddFormFieldAdapter = (field: FormGridFieldType) => {
	const { onFormatValue, onChangeValue, min, max, step, shiftStep } = (field.config || {}) as NumberAdapterConfig;
	return inputNumberAdapter({
		placeholder: field.placeholder || undefined,
		onFormatValue,
		onChangeValue,
		min,
		max,
		step,
		shiftStep,
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
