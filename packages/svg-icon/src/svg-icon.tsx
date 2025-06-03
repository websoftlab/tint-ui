"use client";

import type { SVGAttributes, ReactNode, CSSProperties, AriaRole } from "react";
import type { ThemeStore } from "@tint-ui/theme";

import * as React from "react";
import clsx from "clsx";
import { toCamel } from "@tint-ui/tools/to-case";
import { useTheme, useProps } from "@tint-ui/theme";

export interface SvgIconProps extends SVGAttributes<SVGSVGElement> {
	size?: number;
	title?: string;
	description?: string;
	horizontal?: boolean;
	vertical?: boolean;
	spin?: boolean | number;
	iconName?: string;
}

export interface SvgIconThemeProps extends SvgIconProps {
	icon: string;
}

export type DynamicIconHandler = (name: string, theme: ThemeStore) => React.ElementType | null;

export const createSvgIcon = (
	iconName: string,
	type: "outline" | "filled",
	iconNode: (string | [string, ...any])[]
) => {
	const Icon = React.memo(function Icon() {
		return (
			<>
				{iconNode.map((item, index) => {
					const key = `svg-${index}`;
					if (typeof item === "string") {
						return <path key={key} d={item} />;
					}
					const [As, attrs] = item;
					return <As key={key} {...attrs} />;
				})}
			</>
		);
	});
	const Component = React.forwardRef<SVGSVGElement, SvgIconProps>(
		({ color = "currentColor", stroke = 2, className, children, ...rest }, ref) => {
			return (
				<SvgIcon
					iconName={iconName}
					className={clsx(`icon-${iconName}`, className)}
					{...(type === "filled"
						? {
								stroke: "none",
								fill: color,
						  }
						: {
								strokeWidth: stroke,
								stroke: color,
								fill: "none",
								strokeLinecap: "round",
								strokeLinejoin: "round",
						  })}
					{...rest}
					ref={ref}
				>
					<Icon />
					{children}
				</SvgIcon>
			);
		}
	);
	const camelName = `${toCamel(iconName)}Icon`;
	Icon.displayName = `${camelName}Base`;
	Component.displayName = camelName;
	return Component;
};

const dynamicListener = new Set<DynamicIconHandler>();

const addDynamicIconListener = (handler: DynamicIconHandler) => {
	if (typeof handler === "function") {
		dynamicListener.add(handler);
	}
	return () => {
		dynamicListener.delete(handler);
	};
};

const SvgIcon = React.forwardRef<SVGSVGElement, SvgIconProps>(({ iconName, children, ...props }, ref) => {
	const {
		size = 24,
		title,
		description,
		vertical,
		horizontal,
		rotate = 0,
		spin = false,
		style: styleProp,
		className,
		...rest
	} = useProps("component.svg-icon", props, { name: iconName });

	const transform: string[] = [];
	let style: CSSProperties = {
		...styleProp,
	};

	if (horizontal) {
		transform.push("scaleX(-1)");
	}
	if (vertical) {
		transform.push("scaleY(-1)");
	}
	if (rotate !== 0) {
		transform.push(`rotate(${rotate}deg)`);
	}
	if (transform.length) {
		style.transform = transform.join(" ");
		style.transformOrigin = "center";
	}

	let backdrop: ReactNode = <path stroke="none" fill="none" d={`M0 0h${size}v${size}H0z`} strokeWidth="0" />;
	if (spin && children !== null) {
		const size05 = size / 2;
		let inverse = false;
		let spinDuration = 3;
		if (typeof spin === "number") {
			spinDuration = spin;
			if (spinDuration < 0) {
				spinDuration *= -1;
				inverse = true;
			}
		}
		children = (
			<g>
				{backdrop}
				{children}
				<animateTransform
					attributeName="transform"
					attributeType="XML"
					type="rotate"
					repeatCount="indefinite"
					dur={`${spinDuration}s`}
					from={`0 ${size05} ${size05}`}
					to={`${inverse ? "-360" : "360"} ${size05} ${size05}`}
				/>
			</g>
		);
		backdrop = null;
	}

	let ariaLabelledby: string | undefined;
	let labelledById = rest.id ? `icon-labelledby-${rest.id}` : undefined;
	let describedById = rest.id ? `icon-describedby-${rest.id}` : undefined;
	let role: AriaRole | undefined;

	if (title) {
		if (rest.id) {
			ariaLabelledby = description ? `${labelledById} ${describedById}` : labelledById;
		}
	} else {
		role = "presentation";
	}

	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			width={size}
			height={size}
			{...rest}
			role={role}
			style={style}
			aria-labelledby={ariaLabelledby}
			className={clsx(iconName ? `icon-${iconName}` : null, className)}
			ref={ref}
		>
			{title != null && title !== "" && (
				<title id={labelledById} key="svg-title">
					{title}
				</title>
			)}
			{description != null && description !== "" && (
				<desc id={describedById} key="svg-desc">
					{description}
				</desc>
			)}
			{backdrop}
			{children}
		</svg>
	);
});

const SvgEmptyIcon = createSvgIcon("empty", "outline", []);

const SvgThemeIcon = React.forwardRef<SVGSVGElement, SvgIconThemeProps>(({ icon, ...rest }, ref) => {
	const theme = useTheme();
	let Icon = theme.getIcon(icon);
	if (!Icon) {
		for (const handler of dynamicListener.values()) {
			Icon = handler(icon, theme);
			if (Icon) {
				break;
			}
		}
	}
	if (!Icon) {
		Icon = SvgEmptyIcon;
	}
	return <Icon {...rest} ref={ref} />;
});

SvgThemeIcon.displayName = "SvgThemeIcon";

export { SvgIcon, SvgEmptyIcon, SvgThemeIcon, addDynamicIconListener };
