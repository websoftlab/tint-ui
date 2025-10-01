"use client";

import type { FormGridFieldObjectType } from "./types";

import * as React from "react";
import { useFormContext } from "react-hook-form";
import clsx from "clsx";
import { useProps } from "@tint-ui/theme";
import { isObject } from "@tint-ui/tools/is-plain-object";
import { useFormPrefix, useFormError, FormPrefixProvider, FormInputGroupHelper } from "@tint-ui/form-input-group";
import { useFormGridClasses } from "./classes";
import { useWatch } from "./use-watch";
import { createDefaultValues } from "./create-default-values";
import { ButtonIcon } from "./button-icon";
import { invariant } from "@tint-ui/tools/proof";
import { FormGridList } from "./form-grid-list";

type FormGridObjectContextProviderType = {
	field: FormGridFieldObjectType;
	filled: boolean;
	invalid: boolean;
	errorMessage: string | null;
	disabled: boolean;
	removable: boolean;
	collapsible: boolean;
	themePropsType: string | undefined;
	open: boolean;
	onOpenToggle(): void;
	fill(): void;
	destroy(): void;
};

const useFormGridObject = (
	field: FormGridFieldObjectType,
	{
		disabled = false,
		removable: removableProp = true,
		themePropsType,
	}: { removable?: boolean; disabled?: boolean; themePropsType?: string } = {}
): FormGridObjectContextProviderType => {
	const pref = useFormPrefix();
	const ctx = useFormContext();
	const name = pref.getName(field.name);
	const filled = useWatch(field.name, null, (value) => isObject(value));
	const removable = disabled || field.required ? false : removableProp;
	const collapsible = field.collapsible !== false;
	const [open, setOpen] = React.useState(true);

	const ref = React.useRef({ name, field, filled, disabled, removable });
	Object.assign(ref.current, {
		field,
		name,
		filled,
		disabled,
		removable,
	});

	const [invalid, errorMessage] = useFormError(field.name);
	const { fill, destroy } = React.useMemo(() => {
		return {
			fill() {
				const { field, name, filled, disabled } = ref.current;
				if (!filled && !disabled) {
					ctx.setValue(name, createDefaultValues(field.fields));
				}
			},
			destroy() {
				const { name, filled, removable } = ref.current;
				if (filled && removable) {
					ctx.setValue(name, null);
				}
			},
		};
	}, [ctx]);

	// @ts-ignore
	window.__ctx = ctx;

	return {
		open,
		field,
		filled,
		invalid,
		errorMessage,
		disabled,
		removable,
		collapsible,
		themePropsType,
		fill,
		destroy,
		onOpenToggle() {
			setOpen((prev) => !prev);
		},
	};
};

const FormGridObjectContext = React.createContext<null | FormGridObjectContextProviderType>(null);

const useFormGridObjectContext = () => {
	const ctx = React.useContext(FormGridObjectContext);
	invariant(ctx, "FormGridObjectContext is not defined");
	return ctx;
};

FormGridObjectContext.displayName = "FormGridObjectContext";

const FormGridObjectContextProvider = ({
	value,
	children,
}: {
	value: FormGridObjectContextProviderType;
	children: React.ReactNode;
}) => {
	return (
		<FormGridObjectContext.Provider value={value}>
			<FormPrefixProvider value={value.field.name}>{children}</FormPrefixProvider>
		</FormGridObjectContext.Provider>
	);
};

FormGridObjectContextProvider.displayName = "FormGridObjectContextProvider";

const FormGridFieldObjectHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
	({ className, ...props }, ref) => {
		const classes = useFormGridClasses();
		const object = useFormGridObjectContext();
		const { disabled } = object;

		return (
			<div {...props} className={clsx(className, classes.boxHeader)} ref={ref}>
				{object.collapsible && (
					<ButtonIcon
						themePropsType={object.themePropsType}
						variant="ghost"
						icon={object.open ? "item-collapse" : "item-expand"}
						disabled={disabled}
						onClick={() => {
							object.onOpenToggle();
						}}
					/>
				)}
				<span className={classes.boxLabel}>{object.field.label}</span>
				{object.removable && (
					<ButtonIcon
						themePropsType={object.themePropsType}
						icon="x"
						variant="destructive"
						disabled={disabled}
						onClick={() => {
							object.destroy();
						}}
					/>
				)}
			</div>
		);
	}
);

FormGridFieldObjectHeader.displayName = "FormGridFieldObjectHeader";

const FormGridFieldObjectEmpty = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
	({ className, ...props }, ref) => {
		const classes = useFormGridClasses();
		const object = useFormGridObjectContext();
		return (
			<div
				{...props}
				className={clsx(className, classes.box, classes.boxEmpty, object.invalid && classes.invalid)}
				ref={ref}
			>
				<div className={classes.boxCard}>
					<div className={classes.boxHeader}>
						<span className={classes.boxLabel}>{object.field.label}</span>
						<ButtonIcon
							themePropsType={object.themePropsType}
							icon="plus"
							disabled={object.disabled}
							onClick={() => {
								object.fill();
							}}
						/>
					</div>
				</div>
				{object.invalid && object.errorMessage != null && (
					<FormInputGroupHelper className={classes.helper}>{object.errorMessage}</FormInputGroupHelper>
				)}
			</div>
		);
	}
);

FormGridFieldObjectEmpty.displayName = "FormGridFieldObjectEmpty";

const FormGridFieldObject = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement> & {
		field: FormGridFieldObjectType;
		removable?: boolean;
		disabled?: boolean;
		themePropsType?: string;
	}
>((inputProps, ref) => {
	const { themePropsType } = inputProps;
	const { className, field, removable, disabled, ...rest } = useProps(
		"component.form-grid.field-object",
		inputProps,
		{
			as: "div",
		}
	);

	const object = useFormGridObject(field, { disabled, removable, themePropsType });
	const classes = useFormGridClasses();

	if (!object.filled) {
		return (
			<FormGridObjectContextProvider value={object}>
				<FormGridFieldObjectEmpty {...rest} ref={ref} />
			</FormGridObjectContextProvider>
		);
	}

	return (
		<FormGridObjectContextProvider value={object}>
			<div {...rest} className={clsx(className, classes.box, object.invalid && classes.invalid)} ref={ref}>
				<div className={classes.boxCard}>
					<FormGridFieldObjectHeader />
					{object.open && (
						<div className={classes.content}>
							<FormGridList
								disabled={object.disabled}
								themePropsType={themePropsType}
								fields={object.field.fields}
								rules={object.field.rules}
							/>
						</div>
					)}
				</div>
				{object.invalid && object.errorMessage != null && (
					<FormInputGroupHelper className={classes.helper} themePropsType={themePropsType}>
						{object.errorMessage}
					</FormInputGroupHelper>
				)}
			</div>
		</FormGridObjectContextProvider>
	);
});

FormGridFieldObject.displayName = "FormGridFieldObject";

type FormGridFieldObjectProps = React.ComponentProps<typeof FormGridFieldObject>;

export { FormGridFieldObject };
export type { FormGridFieldObjectProps };
