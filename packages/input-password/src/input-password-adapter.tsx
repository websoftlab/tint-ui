"use client";

import type { ComponentProps } from "react";
import type { FormInputGroupRenderHandler } from "@tint-ui/form-input-group";
import type { InputChangeProps } from "@tint-ui/input";

import * as React from "react";
import { mergeVoidCallbackAsync } from "@tint-ui/tools/merge-void-callback";
import { createTextAdapterHandlers } from "@tint-ui/input/create-text-adapter-handlers";
import { InputPassword } from "./input-password";

type ExcludeProperties = "name" | "required" | "onChange" | "disabled" | "value" | "invalid";

const inputPasswordAdapter = (props: InputPasswordAdapterProps = {}) => {
	const { onBlur: onBlurProp, onChangeValue, onFormatValue, onChangeOptions, ...restProp } = props || {};
	return ((props, { invalid }, ctx) => {
		const { onBlur, onChange, ...rest } = props;
		const { onChange: onChangeHandler } = createTextAdapterHandlers(ctx, props.name, onChange, {
			onChangeValue,
			onChangeOptions,
			onFormatValue,
		});
		return (
			<InputPassword
				{...(restProp as any)}
				{...rest}
				invalid={invalid}
				onBlur={mergeVoidCallbackAsync(onBlurProp as () => void, onBlur as () => Promise<void>)}
				onChange={onChangeHandler}
			/>
		);
	}) as FormInputGroupRenderHandler;
};

type InputPasswordAdapterProps = Omit<ComponentProps<typeof InputPassword>, ExcludeProperties> & InputChangeProps;

export { inputPasswordAdapter };
export type { InputPasswordAdapterProps };
