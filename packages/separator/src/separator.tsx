"use client";

import type { ComponentProps, ElementRef, ComponentPropsWithoutRef } from "react";

import * as React from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";
import clsx from "clsx";
import { useProps } from "@tint-ui/theme";
import { useSeparatorClasses } from "./classes";

const Separator = React.forwardRef<
	ElementRef<typeof SeparatorPrimitive.Root>,
	ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(({ children, ...props }, ref) => {
	const classes = useSeparatorClasses();
	const {
		className,
		orientation = "horizontal",
		decorative = true,
		...separatorProps
	} = useProps("component.separator", props, { as: SeparatorPrimitive.Root });
	return (
		<SeparatorPrimitive.Root
			{...separatorProps}
			orientation={orientation}
			decorative={decorative}
			className={clsx(
				classes.separator,
				orientation === "horizontal" ? classes.horizontal : classes.vertical,
				className
			)}
			ref={ref}
		>
			{children}
		</SeparatorPrimitive.Root>
	);
});

Separator.displayName = SeparatorPrimitive.Root.displayName;

type SeparatorProps = ComponentProps<typeof Separator>;

export { Separator };
export type { SeparatorProps };
