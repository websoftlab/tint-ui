import * as React from "react";
import clsx from "clsx";
import { useProps } from "@tint-ui/theme";
import { useFormGridClasses } from "./classes";

const FormGridGroup = React.forwardRef<
	HTMLDivElement,
	React.FormHTMLAttributes<HTMLDivElement> & { themePropsType?: string }
>((inputProps, ref) => {
	const { className, ...props } = useProps("component.form-grid.group", inputProps, { as: "div" });
	const classes = useFormGridClasses();
	return <div {...props} className={clsx(classes.group, className)} ref={ref} />;
});

FormGridGroup.displayName = "FormGridGroup";

type FormGridGroupProps = React.ComponentProps<typeof FormGridGroup>;

export { FormGridGroup };
export type { FormGridGroupProps };
