"use client";

import type { ReactNode, HTMLAttributes, ComponentProps } from "react";
import type { AlertBuilderSchema, AlertVariant } from "./types";

import * as React from "react";
import clsx from "clsx";
import { SvgThemeIcon } from "@tint-ui/svg-icon";
import { useProps } from "@tint-ui/theme";
import { isEmptyString } from "@tint-ui/tools/is-empty";
import { useAlertFilterClasses, useAlertClasses } from "./classes";

const createP = (text: ReactNode, index: number = 0) => {
	if (text == null) {
		return null;
	}
	const tof = typeof text;
	if (tof === "string" || tof === "number") {
		return <p key={index}>{text}</p>;
	}
	return text;
};

const AlertBuilder = React.forwardRef<
	HTMLDivElement,
	HTMLAttributes<HTMLDivElement> & { schema: AlertBuilderSchema; variant?: AlertVariant }
>(({ schema, children, ...props }, ref) => {
	const { title, icon, description } = schema;
	return (
		<Alert ref={ref} {...props}>
			{!isEmptyString(icon) && <SvgThemeIcon icon={icon} />}
			{!isEmptyString(title) && <AlertTitle>{title}</AlertTitle>}
			{Array.isArray(description) ? (
				<>{description.map((text, index) => createP(text, index))}</>
			) : (
				createP(description)
			)}
			{children}
		</Alert>
	);
});

const Alert = React.forwardRef<
	HTMLDivElement,
	HTMLAttributes<HTMLDivElement> & { variant?: AlertVariant; themePropsType?: string }
>(({ children, ...props }, ref) => {
	const alertProps = useProps("component.alert", { role: "alert", ...props }, { as: "div" });
	const { filterProps } = useAlertFilterClasses();
	const { props: baseProps, className } = filterProps(alertProps);
	return (
		<div {...baseProps} className={className} ref={ref}>
			{children}
		</div>
	);
});

const AlertTitle = React.forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLHeadingElement>>(
	({ children, ...props }, ref) => {
		const classes = useAlertClasses();
		const { className, ...headingProps } = useProps("component.alert.title", props, { as: "h5" });
		return (
			<h5 {...headingProps} className={clsx(classes.title, className)} ref={ref}>
				{children}
			</h5>
		);
	}
);

const AlertDescription = React.forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
	({ children, ...props }, ref) => {
		const classes = useAlertClasses();
		const { className, ...descProps } = useProps("component.alert.description", props, { as: "div" });
		return (
			<div {...descProps} className={clsx(classes.description, className)} ref={ref}>
				{children}
			</div>
		);
	}
);

Alert.displayName = "Alert";
AlertTitle.displayName = "AlertTitle";
AlertDescription.displayName = "AlertDescription";
AlertBuilder.displayName = "AlertBuilder";

type AlertProps = ComponentProps<typeof Alert>;
type AlertTitleProps = ComponentProps<typeof AlertTitle>;
type AlertDescriptionProps = ComponentProps<typeof AlertDescription>;
type AlertBuilderProps = ComponentProps<typeof AlertBuilder>;

export { Alert, AlertTitle, AlertDescription, AlertBuilder };
export type { AlertProps, AlertTitleProps, AlertDescriptionProps, AlertBuilderProps };
