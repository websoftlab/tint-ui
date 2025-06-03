"use client";

import type { ElementType, ReactNode } from "react";
import type { TriggerProp } from "@tint-ui/trigger";
import type { AsComponentWithRef, AsProps, AsRef } from "@tint-ui/tools";
import type { ButtonSize, ButtonVariant } from "./types";
import type { ButtonClasses } from "./classes";

import * as React from "react";
import clsx from "clsx";
import { useProps } from "@tint-ui/theme";
import { asProps } from "@tint-ui/tools/as-props";
import { SvgThemeIcon } from "@tint-ui/svg-icon";
import { useTriggerEventHandler } from "@tint-ui/trigger";
import { useButtonClasses, useButtonFilterClasses } from "./classes";

type Base = {
	size?: ButtonSize;
	variant?: ButtonVariant;
	iconOnly?: boolean;
	full?: boolean;
	iconLeft?: ReactNode;
	iconRight?: ReactNode;
	loading?: boolean;
	rounded?: boolean;
	themePropsType?: string;
};

type ButtonComponent<T extends ElementType = "button"> = AsComponentWithRef<T, ButtonProps<T>>;

type ButtonTriggerComponent<T extends ElementType = "button"> = AsComponentWithRef<T, ButtonTriggerProps<T>>;

type ButtonProps<T extends ElementType = "button"> = AsProps<T, Base>;

type ButtonTriggerProps<T extends ElementType = "button"> = AsProps<
	T,
	Base & {
		trigger: TriggerProp;
		defaultPrevented?: boolean;
		confirmation?: string;
	}
>;

const getIcon = (icon: ReactNode, classes: ButtonClasses, loading?: boolean): ReactNode => {
	if (loading) {
		return <Loader />;
	}
	if (React.isValidElement<{ className?: string }>(icon)) {
		return React.cloneElement(icon, { className: clsx(icon.props.className, classes.icon) });
	}
	return icon;
};

const Loader = () => {
	const classes = useButtonClasses();
	return <SvgThemeIcon icon="loader" className={`${classes.icon} ${classes.spin}`} />;
};

const Button = React.forwardRef(function Button<T extends ElementType = "button">(
	props: Omit<ButtonProps<T>, "ref">,
	ref?: AsRef<T>
) {
	const [As, restButtonProps] = asProps<ButtonProps>(props, { as: "button" });
	const restProps = useProps("component.button", restButtonProps, { as: As });
	const { classes, filterProps } = useButtonFilterClasses();
	const {
		size,
		variant,
		full,
		loading = false,
		rounded,
		disabled,
		iconRight,
		className,
		iconOnly: iconOnlyProp,
		iconLeft: iconLeftProp,
		children: childrenProp,
		...rest
	} = restProps;

	if (As === "button" && !rest.type) {
		(rest as ButtonProps).type = "button";
	} else if (typeof As === "string" && !rest.role) {
		(rest as ButtonProps<"a">).role = "button";
	}

	let iconLeft: ReactNode = iconLeftProp;
	let text: ReactNode = childrenProp;
	let loader: ReactNode = null;
	let iconOnlyAuto = false;

	if (iconLeft == null) {
		if (React.isValidElement(text) && text.type === "svg") {
			iconLeft = getIcon(text, classes, loading);
			text = null;
			if (iconRight == null) {
				iconOnlyAuto = true;
			}
		} else if (iconRight == null && loading) {
			loader = (
				<span className={classes.loader}>
					<Loader />
				</span>
			);
		}
	} else {
		iconLeft = getIcon(iconLeft, classes, loading);
		if (iconRight == null && (text == null || text === "")) {
			iconOnlyAuto = true;
			text = null;
		}
	}

	const iconOnly = typeof iconOnlyProp === "boolean" ? iconOnlyProp : iconOnlyAuto;

	if (typeof text === "string" || typeof text === "number") {
		text = <span>{text}</span>;
	}

	const { className: filterClassName, filters } = filterProps({
		className,
		variant,
		size,
		rounded,
		iconOnly,
		disabled: loading || disabled,
		full: iconOnly ? false : full,
	});

	return (
		<As {...rest} disabled={filters.disabled} className={filterClassName} ref={ref}>
			{iconLeft}
			{text}
			{iconRight != null && getIcon(iconRight, classes, iconLeft == null && loading)}
			{loader}
		</As>
	);
}) as ButtonComponent;

const ButtonTrigger = React.forwardRef(function ButtonTrigger<T extends ElementType = "button">(
	{
		trigger,
		onClick,
		disabled,
		loading: loadingProp,
		defaultPrevented,
		confirmation,
		...props
	}: Omit<ButtonTriggerProps<T>, "ref">,
	ref?: AsRef<T>
) {
	const { loading, clickHandler } = useTriggerEventHandler({
		trigger,
		onClick,
		disabled,
		loading: loadingProp,
		defaultPrevented,
		confirmation,
	});
	return <Button {...props} disabled={disabled} loading={loading} onClick={clickHandler} ref={ref} />;
}) as ButtonTriggerComponent;

Button.displayName = "Button";
ButtonTrigger.displayName = "ButtonTrigger";

export { Button, ButtonTrigger };
export type { ButtonProps, ButtonTriggerProps };
