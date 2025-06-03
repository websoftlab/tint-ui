"use client";

import type { ComponentProps, ComponentPropsWithoutRef } from "react";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import clsx from "clsx";
import { useProps } from "@tint-ui/theme";
import { SvgThemeIcon } from "@tint-ui/svg-icon";
import { useBreadcrumbClasses } from "./classes";

const Breadcrumb = React.forwardRef<HTMLElement, ComponentPropsWithoutRef<"nav">>(({ children, ...props }, ref) => {
	const classes = useBreadcrumbClasses();
	const { className, ...breadcrumbProps } = useProps<ComponentPropsWithoutRef<"nav">>(
		"component.breadcrumb",
		{
			"aria-label": "breadcrumb",
			...props,
		},
		{ as: "nav" }
	);
	return (
		<nav {...breadcrumbProps} className={clsx(classes.breadcrumb, className)} ref={ref}>
			{children}
		</nav>
	);
});

const BreadcrumbList = React.forwardRef<HTMLOListElement, ComponentPropsWithoutRef<"ol">>(
	({ children, ...props }, ref) => {
		const classes = useBreadcrumbClasses();
		const { className, ...listProps } = useProps("component.breadcrumb.list", props, { as: "ol" });
		return (
			<ol {...listProps} className={clsx(classes.list, className)} ref={ref}>
				{children}
			</ol>
		);
	}
);

const BreadcrumbItem = React.forwardRef<HTMLLIElement, ComponentPropsWithoutRef<"li">>(
	({ children, ...props }, ref) => {
		const classes = useBreadcrumbClasses();
		const { className, ...itemProps } = useProps("component.breadcrumb.item", props, { as: "li" });
		return (
			<li {...itemProps} className={clsx(classes.item, className)} ref={ref}>
				{children}
			</li>
		);
	}
);

const BreadcrumbLink = React.forwardRef<
	HTMLAnchorElement,
	ComponentPropsWithoutRef<"a"> & {
		asChild?: boolean;
	}
>(({ asChild, children, ...props }, ref) => {
	const Comp = asChild ? Slot : "a";
	const classes = useBreadcrumbClasses();
	const { className, ...linkProps } = useProps("component.breadcrumb.link", props, { as: Comp });
	return (
		<Comp {...linkProps} className={clsx(classes.link, className)} ref={ref}>
			{children}
		</Comp>
	);
});

const BreadcrumbPage = React.forwardRef<HTMLSpanElement, ComponentPropsWithoutRef<"span">>(
	({ children, ...props }, ref) => {
		const classes = useBreadcrumbClasses();
		const { className, ...pageProps } = useProps<ComponentPropsWithoutRef<"span">>(
			"component.breadcrumb.page",
			{
				role: "link",
				"aria-disabled": "true",
				"aria-current": "page",
				...props,
			},
			{ as: "span" }
		);
		return (
			<span {...pageProps} className={clsx(classes.page, className)} ref={ref}>
				{children}
			</span>
		);
	}
);

const BreadcrumbSeparator = React.forwardRef<HTMLLIElement, ComponentPropsWithoutRef<"li">>(
	({ children, ...props }, ref) => {
		const classes = useBreadcrumbClasses();
		const { className, ...separatorProps } = useProps<ComponentPropsWithoutRef<"li">>(
			"component.breadcrumb.separator",
			{
				role: "presentation",
				"aria-hidden": "true",
				...props,
			},
			{ as: "li" }
		);
		return (
			<li {...separatorProps} className={clsx(classes.separator, className)} ref={ref}>
				{children ?? <SvgThemeIcon icon="chevron-right" />}
			</li>
		);
	}
);

const BreadcrumbEllipsis = React.forwardRef<HTMLLIElement, ComponentPropsWithoutRef<"span"> & { crOnly?: boolean }>(
	({ children = "More", crOnly = true, ...props }, ref) => {
		const classes = useBreadcrumbClasses();
		const { className, ...ellipsisProps } = useProps<ComponentPropsWithoutRef<"span">>(
			"component.breadcrumb.ellipsis",
			{
				role: "presentation",
				"aria-hidden": "true",
				...props,
			},
			{ as: "span" }
		);
		return (
			<span {...ellipsisProps} className={clsx(classes.ellipsis, className)} ref={ref}>
				<SvgThemeIcon icon="dots" />
				{crOnly && <span className={classes.crOnly}>{children}</span>}
			</span>
		);
	}
);

Breadcrumb.displayName = "Breadcrumb";
BreadcrumbList.displayName = "BreadcrumbList";
BreadcrumbItem.displayName = "BreadcrumbItem";
BreadcrumbLink.displayName = "BreadcrumbLink";
BreadcrumbPage.displayName = "BreadcrumbPage";
BreadcrumbSeparator.displayName = "BreadcrumbSeparator";
BreadcrumbEllipsis.displayName = "BreadcrumbEllipsis";

type BreadcrumbProps = ComponentProps<typeof Breadcrumb>;
type BreadcrumbListProps = ComponentProps<typeof BreadcrumbList>;
type BreadcrumbItemProps = ComponentProps<typeof BreadcrumbItem>;
type BreadcrumbLinkProps = ComponentProps<typeof BreadcrumbLink>;
type BreadcrumbPageProps = ComponentProps<typeof BreadcrumbPage>;
type BreadcrumbSeparatorProps = ComponentProps<typeof BreadcrumbSeparator>;
type BreadcrumbEllipsisProps = ComponentProps<typeof BreadcrumbEllipsis>;

export {
	Breadcrumb,
	BreadcrumbList,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbPage,
	BreadcrumbSeparator,
	BreadcrumbEllipsis,
};

export type {
	BreadcrumbProps,
	BreadcrumbListProps,
	BreadcrumbItemProps,
	BreadcrumbLinkProps,
	BreadcrumbPageProps,
	BreadcrumbSeparatorProps,
	BreadcrumbEllipsisProps,
};
