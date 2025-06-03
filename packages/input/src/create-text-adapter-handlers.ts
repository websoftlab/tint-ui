import type { UseFormReturn } from "react-hook-form";
import type { InputChangeProps } from "./types";

import * as React from "react";

const createTextAdapterHandlers = function <T extends HTMLInputElement | HTMLTextAreaElement>(
	ctx: UseFormReturn,
	name: string,
	onChange: React.ChangeEventHandler<T>,
	{ onChangeValue, onFormatValue, onChangeOptions = {} }: InputChangeProps
): { onChange: React.ChangeEventHandler<T> } {
	const changeHandler: React.ChangeEventHandler<T> =
		onChangeValue == null && onFormatValue == null
			? onChange
			: (event) => {
					if (!name) {
						return onChange(event);
					}
					let value = event.target.value;
					if (onFormatValue) {
						value = onFormatValue(value);
					}
					const originValue = ctx.getValues(name);
					const { validate, dirty, touch } = onChangeOptions;
					ctx.setValue(name, value, {
						shouldTouch: touch,
						shouldDirty: dirty,
						shouldValidate: validate,
					});
					if (originValue !== value) {
						const { clearError = true } = onChangeOptions;
						if (clearError) {
							ctx.clearErrors(name);
						}
						if (onChangeValue) {
							onChangeValue(value);
						}
					}
			  };
	return { onChange: changeHandler };
};

export { createTextAdapterHandlers };
