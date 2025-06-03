"use client";

import type { UseFormRegisterReturn, UseFormReturn, RegisterOptions } from "react-hook-form";
import type { ReactNode, HTMLAttributes, ComponentProps, FC } from "react";

import * as React from "react";
import clsx from "clsx";
import { useProps } from "@tint-ui/theme";
import { InputText } from "@tint-ui/input";
import { useFormInputGroupClasses } from "./classes";
import { useFormInputGroup } from "./use-form-input-group";

type FormInputGroupRenderProps<T extends string = string> = UseFormRegisterReturn<T> & { id: string };

type FormInputGroupRenderStatus = { invalid: boolean; message: string | null };

type FormInputGroupRenderHandler<T extends string = string> = (
	props: FormInputGroupRenderProps<T>,
	status: FormInputGroupRenderStatus,
	ctx: UseFormReturn
) => ReactNode;

type FormInputGroupImplProps<T extends string = string> = RegisterOptions<Record<string, any>, T> & {
	name: T;
	inputId?: string;
	children: FormInputGroupRenderHandler<T>;
};

type FormInputGroupProps<T extends string = string> = Omit<
	HTMLAttributes<HTMLDivElement>,
	"children" | keyof RegisterOptions
> &
	FormInputGroupImplProps<T> & {
		label: string | false;
		help?: string | false;
		themePropsType?: string;
	};

const renderEmpty = (props: FormInputGroupRenderProps) => (
	<InputText {...props} readOnly placeholder="Render property is not a function" />
);

const FormInputGroup = React.forwardRef<HTMLDivElement, FormInputGroupProps>((props, ref) => {
	const { themePropsType } = props;
	const {
		className,
		name,
		children,
		inputId,
		help,
		label,
		required,
		min,
		max,
		maxLength,
		minLength,
		validate,
		value,
		setValueAs,
		shouldUnregister,
		onChange,
		onBlur,
		disabled,
		deps,
		pattern,
		valueAsNumber,
		valueAsDate,
		...rest
	} = useProps("component.form-input-group", props);
	const options = {
		name,
		inputId,
		required,
		min,
		max,
		maxLength,
		minLength,
		validate,
		value,
		setValueAs,
		shouldUnregister,
		onChange,
		onBlur,
		disabled,
		deps,
		pattern,
		valueAsNumber,
		valueAsDate,
	} as FormInputGroupImplProps;
	const classes = useFormInputGroupClasses();
	const render = typeof children === "function" ? children : renderEmpty;
	return (
		<FormInputGroupImpl {...options}>
			{(props, status, ctx) => {
				const { invalid, message } = status;
				const helper = help === false ? undefined : invalid ? message : help;
				return (
					<div
						{...rest}
						className={clsx(
							className,
							classes.group,
							props.required && classes.required,
							invalid && classes.invalid
						)}
						ref={ref}
					>
						{label !== false && (
							<FormInputGroupLabel
								themePropsType={themePropsType}
								htmlFor={props.id}
								required={props.required}
							>
								{label}
							</FormInputGroupLabel>
						)}
						{render(props, status, ctx)}
						<FormInputGroupHelper themePropsType={themePropsType}>{helper}</FormInputGroupHelper>
					</div>
				);
			}}
		</FormInputGroupImpl>
	);
});

const FormInputGroupImpl = (({ name, children, inputId, ...options }: FormInputGroupImplProps) => {
	const { props, ctx, ...rest } = useFormInputGroup(name, inputId, options);
	const render = typeof children === "function" ? children : renderEmpty;
	return render(props, rest, ctx);
}) as FC<FormInputGroupImplProps>;

const FormInputGroupLabel = React.forwardRef<
	HTMLLabelElement,
	HTMLAttributes<HTMLLabelElement> & { htmlFor?: string; required?: boolean; themePropsType?: string }
>((inputProps, ref) => {
	const { className, children, required, ...props } = useProps("component.form-input-group.label", inputProps, {
		as: "label",
	});
	const classes = useFormInputGroupClasses();
	return (
		<label className={clsx(classes.label, className)} aria-required={required} {...props} ref={ref}>
			<span className={classes.name}>{children}</span>
			{required && <span className={classes.asterisk}>*</span>}
		</label>
	);
});

const FormInputGroupHelper = React.forwardRef<
	HTMLDivElement,
	HTMLAttributes<HTMLDivElement> & { themePropsType?: string }
>((inputProps, ref) => {
	const { className, children, ...props } = useProps("component.form-input-group.helper", inputProps, { as: "div" });
	const classes = useFormInputGroupClasses();
	if (children == null || children === "") {
		return null;
	}
	return (
		<div className={clsx(classes.helper, className)} {...props} ref={ref}>
			{children}
		</div>
	);
});

type FormInputGroupLabelProps = ComponentProps<typeof FormInputGroupLabel>;
type FormInputGroupHelperProps = ComponentProps<typeof FormInputGroupHelper>;

FormInputGroupImpl.displayName = "FormInputGroupImpl";
FormInputGroup.displayName = "FormInputGroup";
FormInputGroupLabel.displayName = "FormInputGroupLabel";
FormInputGroupHelper.displayName = "FormInputGroupHelper";

export { FormInputGroupImpl, FormInputGroup, FormInputGroupLabel, FormInputGroupHelper };
export type {
	FormInputGroupProps,
	FormInputGroupLabelProps,
	FormInputGroupHelperProps,
	FormInputGroupImplProps,
	FormInputGroupRenderProps,
	FormInputGroupRenderStatus,
	FormInputGroupRenderHandler,
};
