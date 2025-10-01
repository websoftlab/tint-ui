import type { UseFormReturn } from "react-hook-form";
import type { InputChangeNumberProps } from "./types";

import * as React from "react";

const createNumberAdapterHandlers = function <T extends HTMLInputElement = HTMLInputElement>(
	ctx: UseFormReturn,
	name: string,
	onChange: React.ChangeEventHandler<T>,
	onKeyDown: React.KeyboardEventHandler<T> | null | undefined,
	{ onChangeValue, onFormatValue, onChangeOptions = {}, min, max, step = 10, ctrlStep = 100 }: InputChangeNumberProps
): { onChange: React.ChangeEventHandler<T>; onKeyDown: React.KeyboardEventHandler<T> } {
	const setMinMax = (value: number) => {
		if (min != null && value < min) {
			return min;
		}
		if (max != null && value > max) {
			return max;
		}
		return value;
	};

	const setValue = (value: number | null, unsigned = false) => {
		const originValue = ctx.getValues(name);
		const { validate, dirty, touch } = onChangeOptions;

		if (value == null) {
			if (unsigned) {
				ctx.setValue(name, "-");
			} else {
				ctx.resetField(name, {
					keepDirty: dirty,
					keepTouched: touch,
					keepError: validate,
				});
			}
		} else {
			ctx.setValue(name, value, {
				shouldTouch: touch,
				shouldDirty: dirty,
				shouldValidate: validate,
			});
		}

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

	const changeHandler: React.ChangeEventHandler<T> = (event) => {
		if (!name) {
			return onChange(event);
		}

		let textValue = String(event.target.value).trim();
		const unsigned = (min == null || min < 0) && textValue.startsWith("-");
		textValue = (unsigned ? "-" : "") + textValue.replace(/\D/g, "");

		let value: number | null = null;
		if (textValue.length > (unsigned ? 1 : 0)) {
			value = parseInt(textValue);
			if (!Number.isFinite(value)) {
				value = null;
			} else {
				if (onFormatValue) {
					value = onFormatValue(value as number);
				}
				value = setMinMax(value);
			}
		}

		setValue(value, unsigned);
	};

	const keyDownHandler: React.KeyboardEventHandler<T> = (event) => {
		if (name) {
			const key = event.key;
			const isUp = key === "ArrowUp";
			if (isUp || key === "ArrowDown") {
				const stepValue = event.ctrlKey ? ctrlStep : step;
				const value = ctx.getValues(name);

				let number = 0;
				if (typeof value === "string") {
					number = parseInt(value);
				} else if (typeof value === "number") {
					number = value;
				}
				if (!Number.isFinite(number)) {
					number = 0;
				}
				number += isUp ? stepValue : -stepValue;
				number = setMinMax(number);

				return setValue(number);
			}
		}
		if (onKeyDown) {
			return onKeyDown(event);
		}
	};

	return {
		onChange: changeHandler,
		onKeyDown: keyDownHandler,
	};
};

export { createNumberAdapterHandlers };
