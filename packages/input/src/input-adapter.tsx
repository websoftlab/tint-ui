"use client";

import type { ComponentProps } from "react";
import type { FormInputGroupRenderHandler } from "@tint-ui/form-input-group";
import type { InputChangeNumberProps, InputChangeProps } from "./types";

import * as React from "react";
import { mergeVoidCallbackAsync } from "@tint-ui/tools/merge-void-callback";
import { InputText, InputTextarea } from "./input";
import { createTextAdapterHandlers } from "./create-text-adapter-handlers";
import { createNumberAdapterHandlers } from "./create-number-adapter-handlers";

const components = {
	text: InputText,
	textarea: InputTextarea,
};

type ExcludeProperties = "name" | "required" | "onChange" | "disabled" | "value" | "invalid";

const createAdapter = function <T extends keyof typeof components>(
	type: T
): (
	props?: Omit<ComponentProps<(typeof components)[T]>, ExcludeProperties> & InputChangeProps
) => FormInputGroupRenderHandler {
	const Input = components[type];
	return (props) => {
		const { onBlur: onBlurProp, onChangeValue, onFormatValue, onChangeOptions, ...restProp } = props || {};
		return ((props, { invalid }, ctx) => {
			const { onBlur, onChange, ...rest } = props;
			const { onChange: onChangeHandler } = createTextAdapterHandlers(ctx, props.name, onChange, {
				onChangeValue,
				onChangeOptions,
				onFormatValue,
			});
			return (
				<Input
					{...(restProp as any)}
					{...rest}
					invalid={invalid}
					onBlur={mergeVoidCallbackAsync(onBlurProp as () => void, onBlur as () => Promise<void>)}
					onChange={onChangeHandler}
				/>
			);
		}) as FormInputGroupRenderHandler;
	};
};

const inputTextAdapter = createAdapter("text");

const inputTextareaAdapter = createAdapter("textarea");

const inputNumberAdapter = (props: InputNumberAdapterProps = {}): FormInputGroupRenderHandler => {
	const {
		onBlur: onBlurProp,
		onKeyDown,
		onChangeValue,
		onFormatValue,
		onChangeOptions,
		min,
		max,
		step,
		ctrlStep,
		...restProp
	} = props || {};
	return ((props, { invalid }, ctx) => {
		const { onBlur, onChange, ...rest } = props;
		const { onChange: onChangeHandler, onKeyDown: onKeyDownHandler } = createNumberAdapterHandlers(
			ctx,
			props.name,
			onChange,
			onKeyDown,
			{
				onChangeValue,
				onChangeOptions,
				onFormatValue,
				min,
				max,
				step,
				ctrlStep,
			}
		);
		return (
			<InputText
				{...(restProp as any)}
				{...rest}
				inputMode="number"
				invalid={invalid}
				onBlur={mergeVoidCallbackAsync(onBlurProp as () => void, onBlur as () => Promise<void>)}
				onChange={onChangeHandler}
				onKeyDown={onKeyDownHandler}
			/>
		);
	}) as FormInputGroupRenderHandler;
};

type InputNumberAdapterProps = Omit<ComponentProps<typeof InputText>, ExcludeProperties> & InputChangeNumberProps;

type InputTextAdapterProps = Omit<ComponentProps<typeof InputText>, ExcludeProperties> & InputChangeProps;

type InputTextareaAdapterProps = Omit<ComponentProps<typeof InputTextarea>, ExcludeProperties> & InputChangeProps;

export {
	createTextAdapterHandlers,
	createNumberAdapterHandlers,
	inputTextAdapter,
	inputTextareaAdapter,
	inputNumberAdapter,
};
export type {
	InputTextAdapterProps,
	InputTextareaAdapterProps,
	InputChangeProps,
	InputNumberAdapterProps,
	InputChangeNumberProps,
};
