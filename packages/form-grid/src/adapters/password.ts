import type { RevealModeType } from "@tint-ui/input-password";
import type { FormGridFieldType, AddFormFieldAdapter, AddFormFieldAdapterOptions } from "../types";
import type { TextAdapterConfig } from "./text";

import { z } from "zod";
import { inputPasswordAdapter } from "@tint-ui/input-password";

type PasswordAdapterConfig = Omit<TextAdapterConfig, "autoComplete" | "autoCorrect" | "inputMode" | "cols" | "rows"> & {
	revealMode?: RevealModeType;
};

const passwordAdapter: AddFormFieldAdapter = (field: FormGridFieldType) => {
	const { readOnly } = field;
	const { onFormatValue, onChangeValue, onChangeOptions, size, revealMode, autoFocus, form, tabIndex } =
		(field.config || {}) as PasswordAdapterConfig;
	return inputPasswordAdapter({
		placeholder: field.placeholder || undefined,
		onFormatValue,
		onChangeValue,
		onChangeOptions,
		size,
		revealMode,
		readOnly,
		autoFocus,
		form,
		tabIndex,
	});
};

const passwordAdapterOptions: AddFormFieldAdapterOptions = {
	createZodSchema(field) {
		let zodType = z.string();
		if (field.required) {
			zodType = zodType.min(1);
		}
		return z.preprocess(
			(value) => (typeof value === "string" ? value : String(value == null ? "" : value)),
			zodType
		);
	},
	createZodDefaultValue() {
		return "";
	},
};

export { passwordAdapter, passwordAdapterOptions };
export type { PasswordAdapterConfig };
