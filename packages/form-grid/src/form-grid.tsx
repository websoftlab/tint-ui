"use client";

import * as React from "react";
import clsx from "clsx";
import { FormProvider } from "react-hook-form";
import { useProps } from "@tint-ui/theme";
import { useFormContext } from "./context";
import { FormGridFieldItem } from "./form-grid-field-item";
import { ConfirmField } from "./confirm-field";
import { useCalculate } from "./use-calculate";
import { useFormGridClasses } from "./classes";

const noName = Symbol.for("#input.field");
const createKeyControl = () => {
	const map: Record<string | symbol, number> = {
		[noName]: 0,
	};
	return (name: string | symbol) => {
		if (!name) {
			name = noName;
		}
		if (map.hasOwnProperty(name)) {
			return String(name) + ":" + map[name]++;
		}
		map[name] = 1;
		return String(name);
	};
};

const FormGrid = React.forwardRef<
	HTMLFormElement,
	Omit<React.FormHTMLAttributes<HTMLFormElement>, "onSubmit"> & { themePropsType?: string }
>((props, ref) => {
	const { themePropsType } = props;
	const { children, className, ...rest } = useProps("component.form-grid", props, { as: "form" });
	const classes = useFormGridClasses();
	const ctx = useFormContext();
	const formRef = React.useRef<HTMLDivElement | null>(null);
	const grid = useCalculate(formRef, ctx.form.fields);
	const { onSubmit, confirmation, confirmMessage, loading } = ctx;
	const createKey = createKeyControl();
	return (
		<FormProvider {...ctx.ctx}>
			<form {...rest} className={clsx(classes.formGrid, className)} onSubmit={onSubmit} ref={ref}>
				<div className={classes.form} ref={formRef}>
					{grid.map((col, index) => (
						<div key={index} className={classes.group}>
							{col.map(({ field, key }) => (
								<FormGridFieldItem
									key={createKey(field.name)}
									className={classes[key]}
									field={field}
									disabled={loading}
									themePropsType={themePropsType}
								/>
							))}
						</div>
					))}
					{confirmation && (
						<ConfirmField key="confirmation" message={confirmMessage} themePropsType={themePropsType} />
					)}
				</div>
				{children}
			</form>
		</FormProvider>
	);
});

FormGrid.displayName = "FormGrid";

type FormGridProps = React.ComponentProps<typeof FormGrid>;

export { FormGrid };
export type { FormGridProps };
