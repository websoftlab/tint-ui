"use client";

import type { ReactNode } from "react";
import type { FormInputGroupRenderHandler } from "@tint-ui/form-input-group";
import type { InputCheckboxLabelProps, InputCheckboxProps, InputCheckboxGroupProps } from "./input-checkbox";

import * as React from "react";
import { mergeVoidCallbackAsync } from "@tint-ui/tools/merge-void-callback";
import { InputCheckboxLabel, InputRadioLabel, InputCheckboxGroup } from "./input-checkbox";

interface InputCheckboxAdapterProps extends Omit<InputCheckboxLabelProps, "children" | "inputProps"> {
	label: ReactNode;
	inputProps?: Omit<InputCheckboxProps, "name" | "invalid" | "disabled" | "required" | "onChange" | "value">;
}

interface InputCheckboxGroupAdapterProps
	extends Omit<InputCheckboxGroupProps, "name" | "invalid" | "disabled" | "required" | "onChange" | "value"> {
	valueAsNumber?: boolean;
}

const components = {
	checkbox: InputCheckboxLabel,
	radio: InputRadioLabel,
};

const asNumberOption = (valueAsNumberProp: boolean | null | undefined, options: InputCheckboxGroupProps["options"]) => {
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
	return typeof option.value === "number";
};

const createInputCheckboxAdapter = (type: keyof typeof components) => {
	const Label = components[type];
	const radio = type === "radio";
	return (props: InputCheckboxAdapterProps) => {
		const { inputProps = {}, label, ...labelProp } = props;
		const { onBlur: onBlurProp, ...inputPropsRest } = inputProps;
		return ((props, { invalid }, ctx) => {
			const { onBlur, onChange, ref, name, ...rest } = props;
			const originValue = ctx.watch(name);
			return (
				<Label
					{...labelProp}
					inputProps={{
						defaultChecked: radio ? undefined : originValue === true,
						name,
						...inputPropsRest,
						...rest,
						invalid,
						onBlur: mergeVoidCallbackAsync(onBlurProp, onBlur as typeof onBlurProp),
						onChange(event) {
							const checked = event.target.checked;
							if (checked) {
								ctx.clearErrors(name);
							}
							if (radio) {
								if (checked) {
									ctx.setValue(name, event.target.value);
								}
							} else if (checked !== originValue) {
								ctx.setValue(name, checked);
							}
						},
					}}
				>
					{label}
				</Label>
			);
		}) as FormInputGroupRenderHandler;
	};
};

const inputCheckboxLabelAdapter = createInputCheckboxAdapter("checkbox");

const inputRadioLabelAdapter = createInputCheckboxAdapter("radio");

const getValue = function <T extends string | number>(
	origin: T | T[] | null,
	value: string,
	options: {
		checked: boolean;
		multiple: boolean;
		valueAsNumber: boolean;
	}
) {
	const { valueAsNumber, checked, multiple } = options;
	const valueFormat = (valueAsNumber ? parseInt(value) : value) as T;
	if (!multiple) {
		return checked ? valueFormat : null;
	}
	if (origin == null) {
		origin = [];
	} else if (!Array.isArray(origin)) {
		origin = [origin];
	} else {
		origin = origin.slice();
	}
	if (!checked) {
		const index = origin.indexOf(valueFormat);
		if (index !== -1) {
			origin.splice(index, 1);
		}
	} else if (!origin.includes(valueFormat)) {
		origin.push(valueFormat);
	}
	return origin;
};

const inputCheckboxGroupAdapter = (props: InputCheckboxGroupAdapterProps = {}) => {
	const { onBlur: onBlurProp, multiple = false, valueAsNumber, ...checkboxRest } = props;
	const { options } = props;
	return ((props, { invalid }, ctx) => {
		const { onChange, ref, onBlur, ...rest } = props;
		const { name } = props;
		const originValue = ctx.watch(name);
		return (
			<InputCheckboxGroup
				{...checkboxRest}
				{...rest}
				multiple={multiple}
				invalid={invalid}
				onBlur={mergeVoidCallbackAsync(onBlurProp, onBlur as typeof onBlurProp)}
				value={originValue}
				onChange={async (event) => {
					const { checked, value } = event.target;
					if (checked) {
						ctx.clearErrors(name);
					}
					ctx.setValue(
						name,
						getValue(originValue, value, {
							valueAsNumber: asNumberOption(valueAsNumber, options),
							checked,
							multiple,
						})
					);
				}}
			/>
		);
	}) as FormInputGroupRenderHandler;
};

export { inputCheckboxLabelAdapter, inputRadioLabelAdapter, inputCheckboxGroupAdapter };
export type { InputCheckboxAdapterProps, InputCheckboxGroupAdapterProps };
