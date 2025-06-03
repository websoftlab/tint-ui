import type { FormGridFieldType, AddFormFieldAdapter, AddFormFieldAdapterOptions } from "../types";

import { inputTextAdapter, inputTextareaAdapter } from "@tint-ui/input";
import { z } from "zod";

type TextAdapterConfig = {
	onFormatValue?: (value: string) => string;
	onChangeValue?: (value: string) => void;
};

const textAdapter: AddFormFieldAdapter = (field: FormGridFieldType) => {
	const { type = "text" } = field;
	const { onFormatValue, onChangeValue } = (field.config || {}) as TextAdapterConfig;
	const adapter = type === "textarea" ? inputTextareaAdapter : inputTextAdapter;
	return adapter({
		placeholder: field.placeholder || undefined,
		onFormatValue,
		onChangeValue,
	});
};

const textAdapterOptions: AddFormFieldAdapterOptions = {
	createZodSchema(field) {
		const { type = "text" } = field;
		let zodType = z.string();
		if (type !== "textarea") {
			zodType = zodType.trim();
		}
		if (type === "email") {
			zodType = zodType.email();
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

export { textAdapter, textAdapterOptions };
export type { TextAdapterConfig };
