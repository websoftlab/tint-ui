"use client";

import type { InputClassesType } from "./classes";
import type { InputSize } from "./types";

import * as React from "react";
import clsx from "clsx";
import { useLayerForm, applyDataId, useProps } from "@tint-ui/theme";
import { useInputClasses, useInputFilterClasses } from "./classes";

type ManualProps = {
	invalid?: boolean;
	size?: InputSize;
	dirty?: boolean;
	themePropsType?: string;
};

type BaseProps<T> = Omit<T, "size" | "invalid"> & ManualProps;

const InputGroupContext = React.createContext<null | {
	dirty?: boolean;
	invalid?: boolean;
	disabled?: boolean;
	size?: InputSize;
}>(null);

const useInputGroupContext = () => {
	return React.useContext(InputGroupContext);
};

const InputText = React.forwardRef<
	HTMLInputElement,
	Omit<React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>, keyof ManualProps> &
		ManualProps
>((props, ref) => {
	const ctx = useInputGroupContext();
	const layer = useLayerForm();
	const {
		type = "text",
		size = ctx?.size,
		invalid = ctx?.invalid,
		disabled = ctx?.disabled,
		dirty = ctx?.dirty,
		className,
		...inputProps
	} = useProps("component.input-text", applyDataId(layer, props, { property: "name" }), { as: "input", ctx });
	const { classes, filterProps } = useInputFilterClasses();
	const { className: filterClassName } = filterProps({ size, className, dirty });
	return (
		<input
			{...inputProps}
			aria-invalid={invalid}
			type={type}
			disabled={disabled}
			className={`${filterClassName} ${classes.inline}`}
			ref={ref}
		/>
	);
});

const InputTextarea = React.forwardRef<
	HTMLTextAreaElement,
	Omit<
		React.DetailedHTMLProps<React.TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>,
		keyof ManualProps
	> &
		ManualProps
>((props, ref) => {
	const ctx = useInputGroupContext();
	const layer = useLayerForm();
	const {
		className,
		size = ctx?.size,
		invalid = ctx?.invalid,
		disabled = ctx?.disabled,
		dirty = ctx?.dirty,
		...inputProps
	} = useProps("component.input-textarea", applyDataId(layer, props, { property: "name" }), { as: "textarea", ctx });
	const { classes, filterProps } = useInputFilterClasses();
	const { className: filterClassName } = filterProps({ size, className, dirty });
	return (
		<textarea
			{...inputProps}
			aria-invalid={invalid}
			disabled={disabled}
			className={`${filterClassName} ${classes.textarea}`}
			ref={ref}
		/>
	);
});

interface InputGroupProps extends BaseProps<React.HTMLAttributes<HTMLDivElement>> {
	disabled?: boolean;
}

const InputGroup = React.forwardRef<HTMLDivElement, InputGroupProps>(({ children, ...rest }, ref) => {
	const classes = useInputClasses();
	const { className, disabled, invalid, size, ...groupProps } = useProps("component.input-group", rest, {
		as: "div",
	});
	return (
		<InputGroupContext.Provider value={{ disabled, invalid, size }}>
			<div
				aria-invalid={invalid}
				aria-disabled={disabled}
				{...groupProps}
				className={clsx(className, size != null && classes[size], classes.group)}
				ref={ref}
			>
				{children}
			</div>
		</InputGroupContext.Provider>
	);
});

type BtnType = React.ButtonHTMLAttributes<HTMLButtonElement>;
type InputAddonProps =
	| (BaseProps<React.HTMLAttributes<HTMLSpanElement>> & {
			variant?: "text";
	  })
	| (BaseProps<BtnType> & {
			variant: "button";
	  })
	| (BaseProps<React.LabelHTMLAttributes<HTMLLabelElement>> & {
			variant: "label";
	  })
	| (BaseProps<React.LabelHTMLAttributes<HTMLLabelElement>> & {
			variant: "blank";
	  });

const addons: Record<"text" | "button" | "label" | "blank", ["div" | "button" | "label", InputClassesType]> = {
	text: ["div", "addonText"],
	button: ["button", "addonButton"],
	label: ["label", "addonLabel"],
	blank: ["div", "addonBlank"],
};

const InputAddon = React.forwardRef<HTMLSpanElement | HTMLButtonElement | HTMLLabelElement, InputAddonProps>(
	({ children, ...rest }, ref) => {
		const { variant = "text", className, ...addonProps } = useProps("component.input-addon", rest);
		const classes = useInputClasses();
		const ctx = useInputGroupContext();
		const disabled = ctx?.disabled;
		if (variant === "button") {
			if (disabled) {
				(addonProps as BtnType).disabled = true;
			}
			if (!(addonProps as BtnType).type) {
				(addonProps as BtnType).type = "button";
			}
		}
		if (disabled) {
			addonProps["aria-disabled"] = true;
		}
		const [As, classVariant] = addons[variant] || addons.text;
		return (
			<As
				{...(addonProps as React.HTMLAttributes<HTMLSpanElement>)}
				className={clsx(className, classes.addon, classes[classVariant])}
				ref={ref as never}
			>
				{children}
			</As>
		);
	}
);

InputText.displayName = "InputText";
InputTextarea.displayName = "InputTextarea";
InputGroup.displayName = "InputGroup";
InputAddon.displayName = "InputAddon";

type InputTextProps = React.ComponentProps<typeof InputText>;
type InputTextareaProps = React.ComponentProps<typeof InputTextarea>;

export { InputText, InputTextarea, InputGroup, InputAddon, useInputGroupContext };
export type { InputTextProps, InputTextareaProps, InputGroupProps, InputAddonProps };
