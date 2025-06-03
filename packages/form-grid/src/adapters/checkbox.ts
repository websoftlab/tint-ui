import type { FormGridFieldType, AddFormFieldAdapter, AddFormFieldAdapterOptions } from "../types";

import { z } from "zod";
import { inputCheckboxLabelAdapter } from "@tint-ui/input-checkbox";

type CheckboxAdapterConfig = {};

const checkboxAdapter: AddFormFieldAdapter = (field: FormGridFieldType) => {
	return inputCheckboxLabelAdapter({
		label: field.label,
		placeholder: field.placeholder || undefined,
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
