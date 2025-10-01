"use client";

import type { MutableRefObject, MouseEvent } from "react";
import type { InputTextProps, InputGroupProps } from "@tint-ui/input";

import * as React from "react";
import { InputText, InputGroup, InputAddon } from "@tint-ui/input";
import { SvgThemeIcon } from "@tint-ui/svg-icon";

type RevealModeType = "toggle" | "hover" | "press" | "none";

interface InputPasswordProps extends Omit<InputTextProps, "type"> {
	revealMode?: RevealModeType;
	groupProps?: InputGroupProps & { ref?: MutableRefObject<HTMLDivElement> };
}

const eventIsEnabled = (event: MouseEvent<HTMLElement>) =>
	(event.target as HTMLElement)?.getAttribute("aria-disabled") !== "true";

const useInputPassword = (mode: RevealModeType) => {
	const [visible, setVisible] = React.useState(false);
	return {
		visible,
		addonProps: React.useMemo(() => {
			switch (mode) {
				case "none":
					return {};
				case "press":
				case "hover":
					return {
						[mode === "press" ? "onMouseDown" : "onMouseEnter"](event: MouseEvent<HTMLElement>) {
							eventIsEnabled(event) && setVisible(true);
						},
						[mode === "press" ? "onMouseUp" : "onMouseLeave"]() {
							setVisible(false);
						},
					};
			}
			return {
				onClick(event: MouseEvent<HTMLElement>) {
					const enabled = eventIsEnabled(event);
					setVisible((prev) => (enabled ? !prev : false));
				},
			};
		}, [mode, setVisible]),
	};
};

const InputPassword = React.forwardRef<HTMLInputElement, InputPasswordProps>(
	({ revealMode = "toggle", groupProps, disabled, invalid, size, ...props }, ref) => {
		const { visible, addonProps } = useInputPassword(revealMode);
		return (
			<InputGroup disabled={disabled} invalid={invalid} size={size} themePropsType="password" {...groupProps}>
				<InputText
					themePropsType="password"
					{...props}
					ref={ref}
					type={visible ? "text" : "password"}
					autoComplete="off"
					autoCorrect="off"
				/>
				{revealMode !== "none" && (
					<InputAddon
						variant={revealMode === "toggle" ? "button" : "label"}
						themePropsType="password"
						{...addonProps}
					>
						<SvgThemeIcon icon={visible ? "eye-off" : "eye"} />
					</InputAddon>
				)}
			</InputGroup>
		);
	}
);

InputPassword.displayName = "InputPassword";

export { InputPassword };
export type { InputPasswordProps, RevealModeType };
