"use client";

import type { FormInputGroupRenderHandler } from "@tint-ui/form-input-group";
import type { UseFormReturn } from "react-hook-form";
import type { InputSelectProps } from "./types";

import * as React from "react";
import { mergeVoidCallbackAsync } from "@tint-ui/tools/merge-void-callback";
import { InputSelect } from "./input-select";
import { getValue } from "./get-value";

interface InputSelectAdapterProps
	extends Omit<InputSelectProps, "name" | "required" | "onSelectOption" | "disabled" | "value" | "invalid"> {
	onValueChange?(value: null | string | number | (string | number)[]): void;
}

const asNumber = (ctx: UseFormReturn, name: string) => {
	const field = ctx.control._fields[name];
	return field != null && field._f != null && "valueAsNumber" in field._f && field._f.valueAsNumber === true;
};

const asNumberOption = (valueAsNumberProp: boolean | null | undefined, options: InputSelectAdapterProps["options"]) => {
	if (typeof valueAsNumberProp === "boolean") {
		return valueAsNumberProp;
	}
	if (!Array.isArray(options) || options.length === 0) {
		return false;
	}
	const option = options[0];
	if (typeof option === "string") {
		return false;
	}
	if ("value" in option) {
		return typeof option.value === "number";
	}
	return Array.isArray(option.options) && typeof option.options[0]?.value === "number";
};

const inputSelectAdapter = (props: InputSelectAdapterProps = {}) => {
	const { options } = props;
	const {
		multiple = false,
		clearable = false,
		onBlur: onBlurProp,
		valueAsNumber: valueAsNumberProp,
		onValueChange,
		...restProp
	} = props;
	return ((props, { invalid }, ctx) => {
		const { onChange, onBlur, ref, name, ...rest } = props;
		const { watch, setValue } = ctx;
		const originValue = watch(name);
		return (
			<InputSelect
				{...restProp}
				{...rest}
				invalid={invalid}
				value={originValue}
				multiple={multiple}
				clearable={clearable}
				onBlur={mergeVoidCallbackAsync(onBlurProp, onBlur as typeof onBlurProp)}
				onSelectOption={(value, close) => {
					const test = getValue<string | number>(originValue, value, {
						multiple,
						clearable,
						valueAsNumber: asNumberOption(valueAsNumberProp, options) || (!multiple && asNumber(ctx, name)),
					});
					if (test.valid) {
						setValue(name, test.value);
						if (onValueChange) {
							onValueChange(test.value);
						}
						if (!multiple) {
							close();
						}
					}
				}}
			/>
		);
	}) as FormInputGroupRenderHandler;
};

export { inputSelectAdapter };
export type { InputSelectAdapterProps };
