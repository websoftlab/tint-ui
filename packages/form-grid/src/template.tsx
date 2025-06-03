"use client";

import * as React from "react";
import clsx from "clsx";
import { useFormInputGroupClasses, FormInputGroupLabel } from "@tint-ui/form-input-group";
import { useProps } from "@tint-ui/theme";

const Template = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement> & { required?: boolean; label: string | boolean; themePropsType?: string }
>((inputProps, ref) => {
	const { label, children, className, required, ...props } = useProps("component.form-grid.template", inputProps, {
		as: "div",
	});
	const classes = useFormInputGroupClasses();
	return (
		<div {...props} className={clsx(className, classes.group, required && classes.required)} ref={ref}>
			{label !== false && <FormInputGroupLabel required={required}>{label}</FormInputGroupLabel>}
			{children}
		</div>
	);
});

Template.displayName = "Template";

export { Template };
