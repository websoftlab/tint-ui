import type { FormGridFieldType, AddFormFieldAdapter, AddFormFieldAdapterOptions } from "../types";
import type { InputTextAdapterProps, InputTextareaProps, InputTextareaAdapterProps } from "@tint-ui/input";

import { inputTextAdapter, inputTextareaAdapter } from "@tint-ui/input";
import { z } from "zod";

type TextAdapterConfig = Pick<
	InputTextAdapterProps,
	| "onChangeValue"
	| "onChangeOptions"
	| "onFormatValue"
	| "size"
	| "autoFocus"
	| "autoComplete"
	| "autoCorrect"
	| "inputMode"
	| "tabIndex"
	| "form"
> &
	Pick<InputTextareaProps, "rows" | "cols">;

const textAdapter: AddFormFieldAdapter = (field: FormGridFieldType) => {
	const { type = "text", readOnly } = field;
	const {
		onFormatValue,
		onChangeValue,
		onChangeOptions,
		size,
		autoFocus,
		autoCorrect,
		autoComplete,
		inputMode,
		form,
		rows,
		cols,
		tabIndex,
	} = (field.config || {}) as TextAdapterConfig;
	const adapter = type === "textarea" ? inputTextareaAdapter : inputTextAdapter;
	const props = {
		placeholder: field.placeholder || undefined,
		autoFocus,
		autoCorrect,
		autoComplete,
		inputMode,
		readOnly,
		onFormatValue,
		onChangeValue,
		onChangeOptions,
		size,
		form,
		tabIndex,
	};
	if (type === "textarea") {
		if (rows) {
			(props as InputTextareaAdapterProps).rows = rows;
		}
		if (cols) {
			(props as InputTextareaAdapterProps).cols = cols;
		}
	} else if (type === "email") {
		(props as InputTextAdapterProps).type = "email";
	}
	return adapter(props);
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

export { textAdapter, textAdapterOptions };
export type { TextAdapterConfig };
