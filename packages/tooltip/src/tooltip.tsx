"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import clsx from "clsx";
import { useProps } from "@tint-ui/theme";
import { useTooltipClasses } from "./classes";

const TooltipProvider = TooltipPrimitive.Provider;

const Tooltip = TooltipPrimitive.Root;

const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipPortal = TooltipPrimitive.Portal;

const TooltipArrow = TooltipPrimitive.Arrow;

const TooltipContent = React.forwardRef<
	React.ElementRef<typeof TooltipPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>((props, ref) => {
	const classes = useTooltipClasses();
	const {
		className,
		sideOffset = 4,
		...rest
	} = useProps("component.tooltip", props, { as: TooltipPrimitive.Content });
	return (
		<TooltipPrimitive.Content
			ref={ref}
			sideOffset={sideOffset}
			className={clsx(classes.tooltip, className)}
			{...rest}
		/>
	);
});

const TooltipText = React.forwardRef<
	React.ElementRef<typeof TooltipPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> & {
		tooltip: string;
		asChild?: boolean;
	}
>(({ tooltip, asChild, children, ...props }, ref) => {
	return (
		<Tooltip>
			<TooltipTrigger asChild={asChild}>{children}</TooltipTrigger>
			<TooltipPortal>
				<TooltipContent {...props} ref={ref}>
					{tooltip}
				</TooltipContent>
			</TooltipPortal>
		</Tooltip>
	);
});

TooltipContent.displayName = TooltipPrimitive.Content.displayName;
TooltipText.displayName = "TooltipText";

type TooltipProviderProps = React.ComponentProps<typeof TooltipProvider>;
type TooltipProps = React.ComponentProps<typeof Tooltip>;
type TooltipTriggerProps = React.ComponentProps<typeof TooltipTrigger>;
type TooltipContentProps = React.ComponentProps<typeof TooltipContent>;
type TooltipPortalProps = React.ComponentProps<typeof TooltipPortal>;
type TooltipArrowProps = React.ComponentProps<typeof TooltipArrow>;
type TooltipTextProps = React.ComponentProps<typeof TooltipText>;

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider, TooltipPortal, TooltipArrow, TooltipText };
export type {
	TooltipProviderProps,
	TooltipProps,
	TooltipTriggerProps,
	TooltipContentProps,
	TooltipPortalProps,
	TooltipArrowProps,
	TooltipTextProps,
};
