"use client";

import type { ElementRef, ComponentPropsWithoutRef, ComponentProps } from "react";

import * as React from "react";
import { Root as Popover, Trigger as PopoverTrigger, Portal, Content } from "@radix-ui/react-popover";
import clsx from "clsx";
import { useProps } from "@tint-ui/theme";
import { usePopoverClasses } from "./classes";

const PopoverContent = React.forwardRef<
	ElementRef<typeof Content>,
	ComponentPropsWithoutRef<typeof Content> & { themePropsType?: string }
>((props, ref) => {
	const classes = usePopoverClasses();
	const {
		className,
		align = "center",
		sideOffset = 4,
		...contentProps
	} = useProps("component.popover", props, { as: Content });
	return (
		<Portal>
			<Content
				{...contentProps}
				align={align}
				sideOffset={sideOffset}
				className={clsx(classes.popover, className)}
				ref={ref}
			/>
		</Portal>
	);
});

PopoverContent.displayName = Content.displayName;

type PopoverContentProps = ComponentProps<typeof PopoverContent> & { themePropsType?: string };

export { Popover, PopoverTrigger, PopoverContent };
export type { PopoverContentProps };
