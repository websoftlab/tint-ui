import type { InputCheckboxAdapterProps } from "@tint-ui/input-checkbox";
import type { FormGridFieldType, AddFormFieldAdapter, AddFormFieldAdapterOptions } from "../types";

import { z } from "zod";
import { inputCheckboxLabelAdapter } from "@tint-ui/input-checkbox";

type CheckboxAdapterConfig = Pick<InputCheckboxAdapterProps, "inputProps" | "inputMode">;

const checkboxAdapter: AddFormFieldAdapter = (field: FormGridFieldType) => {
	const { inputProps, inputMode } = (field.config || {}) as CheckboxAdapterConfig;
	const { label, readOnly = inputProps?.readOnly } = field;
	return inputCheckboxLabelAdapter({
		label,
		placeholder: field.placeholder || undefined,
		inputMode,
		readOnly,
		inputProps,
	});
};

const checkboxAdapterOptions: AddFormFieldAdapterOptions = {
	label: false,
	createZodSchema({ name }, values) {
		return z
			.boolean()
			.default(name != null && typeof values[name] === "boolean" ? (values[name] as boolean) : false);
	},
	createZodDefaultValue() {
		return false;
	},
};

export { checkboxAdapter, checkboxAdapterOptions };
export type { CheckboxAdapterConfig };
