"use client";

import type { FormInputGroupRenderHandler } from "@tint-ui/form-input-group";
import type { UseFormReturn } from "react-hook-form";
import type { InputSelectOption } from "@tint-ui/tools";
import type { InputSelectProps } from "./types";

import * as React from "react";
import { InputSelect } from "./input-select";
import { getValue } from "./get-value";

interface InputSelectAdapterProps
	extends Omit<InputSelectProps, "name" | "required" | "onSelectOption" | "disabled" | "value" | "invalid"> {
	onValueChange?(value: null | string | number | (string | number)[]): void;
	onOptionChange?(option: InputSelectOption | null): void;
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
		valueAsNumber: valueAsNumberProp,
		onValueChange,
		onOptionChange,
		...restProp
	} = props;
	return ((props, { invalid }, ctx) => {
		const { name, disabled, required } = props;
		const { watch, setValue, clearErrors } = ctx;
		const originValue = watch(name);
		return (
			<InputSelect
				{...restProp}
				required={required}
				disabled={disabled}
				name={name}
				invalid={invalid}
				value={originValue}
				multiple={multiple}
				clearable={clearable}
				onSelectOption={(value, { close, option }) => {
					const test = getValue<string | number>(originValue, value, {
						multiple,
						clearable,
						valueAsNumber: asNumberOption(valueAsNumberProp, options) || (!multiple && asNumber(ctx, name)),
					});
					if (test.valid) {
						setValue(name, test.value);
						clearErrors(name);
						if (onValueChange) {
							onValueChange(test.value);
						}
						if (!multiple) {
							close();
							if (onOptionChange) {
								onOptionChange(option);
							}
						}
					}
				}}
			/>
		);
	}) as FormInputGroupRenderHandler;
};

export { inputSelectAdapter };
export type { InputSelectAdapterProps };
