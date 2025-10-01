"use client";

import * as React from "react";
import { useProps } from "@tint-ui/theme";
import { Button } from "@tint-ui/button";
import { SvgThemeIcon } from "@tint-ui/svg-icon";

const ButtonIcon = React.forwardRef<
	HTMLButtonElement,
	React.ButtonHTMLAttributes<HTMLButtonElement> & {
		icon: string;
		variant?: "ghost" | "outline" | "destructive";
		disabled?: boolean;
		onClick: () => void;
		themePropsType?: string;
	}
>((props, ref) => {
	const {
		icon,
		variant = "outline",
		disabled = false,
		onClick,
		...rest
	} = useProps("component.form-grid.button-icon", props, { as: "button" });
	return (
		<Button
			{...rest}
			size="sm"
			iconOnly
			variant={variant}
			disabled={disabled}
			iconLeft={<SvgThemeIcon icon={icon} />}
			onClick={onClick}
			ref={ref}
		/>
	);
});

ButtonIcon.displayName = "ButtonIcon";

type ButtonIconProps = React.ComponentProps<typeof ButtonIcon>;

export { ButtonIcon };
export type { ButtonIconProps };
