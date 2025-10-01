"use client";

import type { SlideNavigatorProps } from "./slide-navigator";
import type { ButtonVariant, ButtonProps } from "@tint-ui/button";
import type { SlideItemBuildType } from "./types";

import * as React from "react";
import { Button, ButtonTrigger } from "@tint-ui/button";
import { Slide } from "./slide";
import { SlideNavigator } from "./slide-navigator";

type SchemaType = {
	variant?: ButtonVariant;
	selectedVariant?: ButtonVariant;
	slides: SlideItemBuildType[];
};

const SlideNavigatorBuilder = React.forwardRef<
	HTMLDivElement,
	Omit<SlideNavigatorProps, "ref" | keyof SchemaType> & SchemaType
>(({ size = "md", variant = "ghost", selectedVariant, slides = [], ...props }, ref) => {
	const buttonSize = size === "auto" ? undefined : size;
	if (!selectedVariant) {
		selectedVariant = variant === "ghost" ? "secondary" : "primary";
	}
	return (
		<SlideNavigator {...props} size={size} ref={ref}>
			{slides.map((item, i) => {
				const { trigger } = item;
				const buttonProps: Pick<ButtonProps, "children" | "size" | "onClick" | "variant" | "disabled"> = {
					children: item.label,
					size: buttonSize,
					variant: item.selected ? selectedVariant : variant,
					onClick: item.onClick,
					disabled: item.disabled,
				};
				return (
					<Slide asChild key={i}>
						{trigger ? <ButtonTrigger trigger={trigger} {...buttonProps} /> : <Button {...buttonProps} />}
					</Slide>
				);
			})}
		</SlideNavigator>
	);
});

SlideNavigatorBuilder.displayName = "SlideNavigatorBuilder";

type SlideNavigatorBuilderProps = React.ComponentProps<typeof SlideNavigatorBuilder>;

export { SlideNavigatorBuilder };
export type { SlideNavigatorBuilderProps };
