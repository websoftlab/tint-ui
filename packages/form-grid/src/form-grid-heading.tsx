import * as React from "react";
import clsx from "clsx";
import { useProps } from "@tint-ui/theme";
import { useFormGridClasses } from "./classes";
import { useFormPrefix } from "@tint-ui/form-input-group";

const FormGridHeading = React.forwardRef<
	HTMLHeadingElement,
	React.FormHTMLAttributes<HTMLHeadingElement> & { themePropsType?: string }
>((inputProps, ref) => {
	const { path } = useFormPrefix();
	const As = path.length > 0 ? "h3" : "h2";
	const { className, ...props } = useProps("component.form-grid.heading", inputProps, { as: As });
	const classes = useFormGridClasses();
	return <As {...props} className={clsx(classes.heading, className)} ref={ref} />;
});

FormGridHeading.displayName = "FormGridHeading";

type FormGridHeadingProps = React.ComponentProps<typeof FormGridHeading>;

export { FormGridHeading };
export type { FormGridHeadingProps };
