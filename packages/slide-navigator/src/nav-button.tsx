"use client";

import type { ButtonProps } from "@tint-ui/button";

import * as React from "react";
import clsx from "clsx";
import { SvgThemeIcon } from "@tint-ui/svg-icon";
import { Button } from "@tint-ui/button";
import { useSlideNavigatorClasses } from "./classes";

const NavButton = React.forwardRef<HTMLButtonElement, ButtonProps & { mode: "previous" | "next" }>(
	({ mode, className, themePropsType = "slide-navigator", ...props }, ref) => {
		const classes = useSlideNavigatorClasses();
		const prev = mode === "previous";
		return (
			<Button
				variant="ghost"
				{...props}
				ref={ref}
				data-type="slider-nav-button"
				data-direction={mode}
				themePropsType={themePropsType}
				className={clsx(classes.button, className)}
				iconOnly
				iconLeft={<SvgThemeIcon icon={prev ? "chevron-left" : "chevron-right"} />}
			/>
		);
	}
);

NavButton.displayName = "NavButton";

type NavButtonProps = React.ComponentProps<typeof NavButton>;

export { NavButton };
export type { NavButtonProps };
