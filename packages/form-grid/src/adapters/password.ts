import type { RevealModeType } from "@tint-ui/input-password";
import type { FormGridFieldType, AddFormFieldAdapter, AddFormFieldAdapterOptions } from "../types";
import type { TextAdapterConfig } from "./text";

import { z } from "zod";
import { inputPasswordAdapter } from "@tint-ui/input-password";

type PasswordAdapterConfig = TextAdapterConfig & {
	revealMode?: RevealModeType;
};

const passwordAdapter: AddFormFieldAdapter = (field: FormGridFieldType) => {
	const { onFormatValue, onChangeValue, revealMode } = (field.config || {}) as PasswordAdapterConfig;
	return inputPasswordAdapter({
		placeholder: field.placeholder || undefined,
		onFormatValue,
		onChangeValue,
		revealMode,
	});
};

const passwordAdapterOptions: AddFormFieldAdapterOptions = {
	createZodSchema() {
		return z.preprocess(
			(value) => (typeof value === "string" ? value : String(value == null ? "" : value)),
			z.string()
		);
	},
	createZodDefaultValue() {
		return "";
	},
};

export { passwordAdapter, passwordAdapterOptions };
export type { PasswordAdapterConfig };
