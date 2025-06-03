"use client";

import type { HTMLAttributes, ComponentProps } from "react";

import * as React from "react";
import clsx from "clsx";
import { useCardClasses } from "./classes";
import { useProps } from "@tint-ui/theme";

type Props = HTMLAttributes<HTMLDivElement>;

const Card = React.forwardRef<HTMLDivElement, Props>(({ children, ...props }, ref) => {
	const { className, ...cardProps } = useProps("component.card", props, { as: "div" });
	const classes = useCardClasses();
	return (
		<div {...cardProps} className={clsx(classes.card, className)} ref={ref}>
			{children}
		</div>
	);
});

const CardHeader = React.forwardRef<HTMLDivElement, Props>(({ children, ...props }, ref) => {
	const { className, ...headerProps } = useProps("component.card.header", props, { as: "div" });
	const classes = useCardClasses();
	return (
		<div {...headerProps} className={clsx(classes.header, className)} ref={ref}>
			{children}
		</div>
	);
});

const CardTitle = React.forwardRef<HTMLDivElement, Props>(({ children, ...props }, ref) => {
	const { className, ...titleProps } = useProps("component.card.title", props, { as: "div" });
	const classes = useCardClasses();
	return (
		<div {...titleProps} className={clsx(classes.title, className)} ref={ref}>
			{children}
		</div>
	);
});

const CardDescription = React.forwardRef<HTMLDivElement, Props>(({ children, ...props }, ref) => {
	const { className, ...descriptionProps } = useProps("component.card.description", props, { as: "div" });
	const classes = useCardClasses();
	return (
		<div {...descriptionProps} className={clsx(classes.description, className)} ref={ref}>
			{children}
		</div>
	);
});

const CardContent = React.forwardRef<HTMLDivElement, Props>(({ children, ...props }, ref) => {
	const { className, ...contentProps } = useProps("component.card.content", props, { as: "div" });
	const classes = useCardClasses();
	return (
		<div {...contentProps} className={clsx(classes.content, className)} ref={ref}>
			{children}
		</div>
	);
});

const CardFooter = React.forwardRef<HTMLDivElement, Props>(({ children, ...props }, ref) => {
	const { className, ...footerProps } = useProps("component.card.footer", props, { as: "div" });
	const classes = useCardClasses();
	return (
		<div {...footerProps} className={clsx(classes.footer, className)} ref={ref}>
			{children}
		</div>
	);
});

Card.displayName = "Card";
CardHeader.displayName = "CardHeader";
CardTitle.displayName = "CardTitle";
CardDescription.displayName = "CardDescription";
CardContent.displayName = "CardContent";
CardFooter.displayName = "CardFooter";

type CardProps = ComponentProps<typeof Card>;
type CardHeaderProps = ComponentProps<typeof CardHeader>;
type CardTitleProps = ComponentProps<typeof CardTitle>;
type CardDescriptionProps = ComponentProps<typeof CardDescription>;
type CardContentProps = ComponentProps<typeof CardContent>;
type CardFooterProps = ComponentProps<typeof CardFooter>;

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
export type { CardProps, CardHeaderProps, CardTitleProps, CardDescriptionProps, CardContentProps, CardFooterProps };
