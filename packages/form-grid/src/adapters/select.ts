import type { InputSelectOption } from "@tint-ui/tools";
import type { InputSelectLexicon, OptionType } from "@tint-ui/input-select";
import type { FormGridFieldType, AddFormFieldAdapter, AddFormFieldAdapterOptions } from "../types";

import { z } from "zod";
import { isObject } from "@tint-ui/tools/is-plain-object";
import { inputSelectAdapter } from "@tint-ui/input-select";

type SelectAdapterConfig = {
	options: OptionType[];
	disableSearch?: boolean;
	valueAsNumber?: boolean;
	lexicon?: InputSelectLexicon;
};

const selectAdapter: AddFormFieldAdapter = (field: FormGridFieldType) => {
	const { options = [], disableSearch, valueAsNumber, lexicon = null } = (field.config || {}) as SelectAdapterConfig;

	let asNumber = valueAsNumber === true;
	if (!asNumber) {
		const option = getOption(options[0]);
		if (option != null && typeof option.value === "number") {
			asNumber = true;
		}
	}

	return inputSelectAdapter({
		options,
		valueAsNumber: asNumber,
		disableSearch: typeof disableSearch === "boolean" ? disableSearch : options.length < 20,
		lexicon: {
			...lexicon,
			placeholder: field.placeholder || undefined,
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

const selectAdapterOptions: AddFormFieldAdapterOptions = {
	createZodSchema(field) {
		const { options } = (field.config || {}) as SelectAdapterConfig;
		const variant = new Set<string | number>();
		let first: string | number | null = null;
		if (Array.isArray(options)) {
			for (const rawOption of options) {
				const option = getOption(rawOption);
				if (option != null) {
					variant.add(option.value);
					if (first === null) {
						first = option.value;
					}
				}
			}
		}
		if (!variant.size) {
			first = "";
			variant.add(first);
		}
		return z
			.any()
			.default(first)
			.refine((value) => {
				if (variant.has(value)) {
					return value;
				}
			});
	},
	createZodDefaultValue(field) {
		const { options } = (field.config || {}) as SelectAdapterConfig;
		if (!Array.isArray(options) || options.length === 0) {
			return null;
		}
		let first: unknown = null;
		for (const rawOption of options) {
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
