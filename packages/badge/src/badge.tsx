"use client";

import type { ElementType } from "react";
import type { BadgeVariant } from "./types";
import type { AsComponentWithRef, AsProps, AsRef } from "@tint-ui/tools";

import * as React from "react";
import { useProps } from "@tint-ui/theme";
import { asProps } from "@tint-ui/tools/as-props";
import { useBadgeFilterClasses } from "./classes";

type BadgeComponent<T extends ElementType = "span"> = AsComponentWithRef<T, BadgeProps<T>>;

type BadgeProps<T extends ElementType = "span"> = AsProps<
	T,
	{
		variant?: BadgeVariant;
		interactive?: boolean;
	}
>;

const hasInteractive = function <T extends ElementType = "span">(
	as: T,
	interactive: boolean | undefined | null,
	props: BadgeProps<T>
) {
	if (typeof interactive === "boolean") {
		return interactive;
	}
	return (
		as === "button" ||
		(as === "a" && "href" in props) ||
		(typeof as === "string" && (props.tabIndex > 0 || props.role === "button"))
	);
};

const Badge = React.forwardRef(function Badge<T extends ElementType = "span">(
	{ children, ...props }: Omit<BadgeProps<T>, "ref">,
	ref?: AsRef<T>
) {
	const [As, rootProps] = asProps<BadgeProps>(props, { as: "span" });
	const { interactive, ...rest } = useProps("component.badge", rootProps, { as: As });
	const { filterProps } = useBadgeFilterClasses();
	const filter = filterProps({ interactive: hasInteractive(As, interactive, rest), ...rest });
	return (
		<As {...filter.props} className={filter.className} ref={ref}>
			{children}
		</As>
	);
}) as BadgeComponent;

export { Badge };
export type { BadgeProps };
