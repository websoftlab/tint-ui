import type { InputSelectOption } from "@tint-ui/tools";
import type { InputSelectAdapterProps } from "@tint-ui/input-select";
import type { FormGridFieldType, AddFormFieldAdapter, AddFormFieldAdapterOptions } from "../types";

import { z } from "zod";
import { isObject } from "@tint-ui/tools/is-plain-object";
import { inputSelectAdapter } from "@tint-ui/input-select";

type SelectAdapterConfig = Pick<
	InputSelectAdapterProps,
	| "options"
	| "initialOptions"
	| "disableSearch"
	| "lexicon"
	| "valueAsNumber"
	| "renderOption"
	| "renderTag"
	| "size"
	| "clearable"
	| "multiple"
	| "tagged"
	| "tagsProps"
	| "popoverProps"
	| "inputHidden"
	| "onValueChange"
	| "onOptionChange"
>;

const selectAdapter: AddFormFieldAdapter = (field: FormGridFieldType) => {
	const { readOnly } = field;
	const {
		options = [],
		initialOptions,
		lexicon = null,
		disableSearch,
		valueAsNumber,
		renderOption,
		renderTag,
		size,
		clearable,
		multiple,
		tagged,
		tagsProps,
		popoverProps,
		inputHidden,
		onOptionChange,
		onValueChange,
	} = (field.config || {}) as SelectAdapterConfig;

	const opts = Array.isArray(options) ? options : initialOptions;

	let asNumber = false;
	if (typeof valueAsNumber === "boolean") {
		asNumber = valueAsNumber;
	} else if (Array.isArray(opts)) {
		const option = getOption(opts[0]);
		if (option != null && typeof option.value === "number") {
			asNumber = true;
		}
	}

	return inputSelectAdapter({
		options,
		initialOptions,
		readOnly,
		renderOption,
		renderTag,
		size,
		clearable,
		multiple,
		tagged,
		tagsProps,
		popoverProps,
		inputHidden,
		onOptionChange,
		onValueChange,
		valueAsNumber: asNumber,
		disableSearch: typeof disableSearch === "boolean" ? disableSearch : options.length < 20,
		lexicon: {
			...lexicon,
			placeholder: field.placeholder || lexicon?.placeholder || undefined,
		},
	});
};

const getOption = (option: unknown): InputSelectOption | null => {
	if (typeof option === "string" || typeof option === "number") {
		return { value: option, label: String(option) };
	}
	if (isObject(option) && "value" in option) {
		return option as InputSelectOption;
	}
	return null;
};

const formatValue = (value: unknown, asNumber: boolean | null) => {
	if (asNumber === true) {
		if (asNumber && typeof value === "string") {
			value = parseInt(value);
		}
	} else if (asNumber === false && typeof value === "number") {
		value = String(value);
	}
	return value;
};

const selectAdapterOptions: AddFormFieldAdapterOptions = {
	createZodSchema(field) {
		const { required = false } = field;
		const { options, initialOptions, valueAsNumber, multiple } = (field.config || {}) as SelectAdapterConfig;
		const manualAsNumber = typeof valueAsNumber === "boolean";
		let type: z.ZodType;
		let first: string | number | null = null;
		let asNumber: null | boolean = null;

		// dynamic loader
		if (typeof options === "function") {
			if (manualAsNumber) {
				type = valueAsNumber ? z.number() : z.string();
			} else {
				type = z.union([z.number(), z.string()]);
			}
			if (multiple) {
				return required ? z.array(type).min(1) : z.array(type);
			}
			return required ? type : type.nullish();
		}

		// static data
		const opts = Array.isArray(options) ? options : initialOptions;
		const variant = new Set<string | number>();

		if (Array.isArray(opts)) {
			for (const rawOption of opts) {
				const option = getOption(rawOption);
				if (option != null) {
					variant.add(option.value);
					if (first === null) {
						first = option.value;
					}
				}
			}
		}

		if (manualAsNumber || variant.size) {
			asNumber = manualAsNumber ? (valueAsNumber as boolean) : typeof first === "number";
			type = asNumber ? z.number() : z.string();
		} else {
			type = z.union([z.number(), z.string()]);
		}

		if (multiple) {
			return (required ? z.array(type).min(1) : z.array(type).nullish()).refine((value) => {
				return Array.isArray(value)
					? value.every((val) => {
							val = formatValue(val, asNumber);
							return variant.has(val);
					  })
					: false;
			});
		}
		if (!required) {
			type = type.nullish();
		}
		return type.refine((value) => {
			if (value == null) {
				return !required;
			}
			value = formatValue(value, asNumber);
			return variant.has(value);
		});
	},
	createZodDefaultValue(field) {
		const { options = [], initialOptions } = (field.config || {}) as SelectAdapterConfig;
		const opts = Array.isArray(options) ? options : initialOptions;
		if (!Array.isArray(opts) || opts.length === 0) {
			return null;
		}
		let first: unknown = null;
		for (const rawOption of opts) {
			const option = getOption(rawOption);
			if (option != null) {
				if (!option.disabled) {
					return option.value;
				} else if (first === null) {
					first = option.value;
				}
			}
		}
		return first;
	},
};

export { selectAdapter, selectAdapterOptions };
export type { SelectAdapterConfig };
