"use client";

import * as React from "react";
import clsx from "clsx";
import { FormProvider } from "react-hook-form";
import { useProps } from "@tint-ui/theme";
import { useForkRef } from "@tint-ui/tools/use-fork-ref";
import { useFormContext, useFormGridSize, FormGridSizeContext } from "./context";
import { ConfirmField } from "./confirm-field";
import { useCalculateGridSize } from "./use-calculate-grid-size";
import { useFormGridClasses } from "./classes";
import { FormGridList } from "./form-grid-list";

const Form = React.forwardRef<HTMLFormElement, React.FormHTMLAttributes<HTMLFormElement> & { themePropsType?: string }>(
	(inputProps, ref) => {
		const { className, ...props } = useProps("component.form-grid.form", inputProps, { as: "form" });
		const classes = useFormGridClasses();
		return <form {...props} className={clsx(classes.form, className)} ref={ref} />;
	}
);

const FormContent = React.forwardRef<
	HTMLDivElement,
	React.FormHTMLAttributes<HTMLDivElement> & { themePropsType?: string }
>((inputProps, ref) => {
	const { className, ...props } = useProps("component.form-grid.content", inputProps, { as: "div" });
	const classes = useFormGridClasses();
	const innerRef = React.useRef<HTMLDivElement | null>(null);
	const forkRef = useForkRef(innerRef, ref);
	const size = useCalculateGridSize(innerRef);
	return (
		<FormGridSizeContext.Provider value={size}>
			<div {...props} className={clsx(classes.content, className)} ref={forkRef} />
		</FormGridSizeContext.Provider>
	);
});

const FormGrid = React.forwardRef<
	HTMLFormElement,
	Omit<React.FormHTMLAttributes<HTMLFormElement>, "onSubmit"> & { themePropsType?: string }
>((props, ref) => {
	const { themePropsType } = props;
	const { children, ...rest } = useProps("component.form-grid", props, { as: Form });
	const ctx = useFormContext();
	const { onSubmit, confirmation, confirmMessage, loading } = ctx;
	const { fields, rules } = ctx.form;
	return (
		<FormProvider {...ctx.ctx}>
			<Form {...rest} themePropsType={themePropsType} onSubmit={onSubmit} ref={ref}>
				<FormContent themePropsType={themePropsType}>
					<FormGridList disabled={loading} themePropsType={themePropsType} fields={fields} rules={rules} />
					{confirmation && (
						<ConfirmField key="confirmation" message={confirmMessage} themePropsType={themePropsType} />
					)}
				</FormContent>
				{children}
			</Form>
		</FormProvider>
	);
});

Form.displayName = "Form";
FormContent.displayName = "FormContent";
FormGrid.displayName = "FormGrid";

type FormProps = React.ComponentProps<typeof Form>;
type FormContentProps = React.ComponentProps<typeof FormContent>;
type FormGridProps = React.ComponentProps<typeof FormGrid>;

export { Form, FormContent, FormGrid, useFormGridSize };
export type { FormProps, FormContentProps, FormGridProps };
