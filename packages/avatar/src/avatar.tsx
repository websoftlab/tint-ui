"use client";

import type {
	HTMLAttributes,
	ElementRef,
	ComponentPropsWithoutRef,
	ComponentProps,
	ReactNode,
	ReactElement,
} from "react";
import type { TriggerProp } from "@tint-ui/trigger";
import type { AvatarBadgeType, AvatarBuilderSchema, AvatarSize } from "./types";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import clsx from "clsx";
import { useProps } from "@tint-ui/theme";
import { SvgThemeIcon } from "@tint-ui/svg-icon";
import { useTriggerEventHandler } from "@tint-ui/trigger";
import { getColor, getShortName } from "./utils";
import { useAvatarFilterClasses, useAvatarClasses } from "./classes";

const isBadge = (element: ReactElement) => {
	return (
		element.type === AvatarBadge ||
		(typeof element.type === "function" &&
			"displayName" in element.type &&
			element.type.displayName === AvatarBadge.displayName)
	);
};

const badgeFilter = (children: ReactNode): [ReactNode, ReactNode] => {
	if (React.isValidElement(children)) {
		if (children.type === React.Fragment) {
			return badgeFilter(children.props.children);
		}
		if (isBadge(children)) {
			return [children, null];
		}
	}
	if (Array.isArray(children)) {
		const index = children.findIndex((child) => React.isValidElement(child) && isBadge(child));
		if (index !== -1) {
			const child = children.slice();
			const badge = child.splice(index, 1)[0];
			return [badge, child];
		}
	}
	return [null, children];
};

const fallbackName = (name: ReactNode) => {
	return typeof name !== "string" || name.length < 3 ? name : getShortName(name);
};

const Avatar = React.forwardRef<
	ElementRef<typeof AvatarPrimitive.Root>,
	ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> & {
		size?: AvatarSize;
	}
>(({ children, ...props }, ref) => {
	const rootProps = useProps("component.avatar", props, { as: AvatarPrimitive.Root });
	const { filterProps, classes } = useAvatarFilterClasses();
	const { className, props: avatarProps } = filterProps(rootProps);
	const [badge, child] = badgeFilter(children);
	return (
		<AvatarPrimitive.Root {...avatarProps} className={className} ref={ref}>
			{badge}
			<div className={classes.wrap}>{child}</div>
		</AvatarPrimitive.Root>
	);
});

const AvatarTrigger = React.forwardRef<
	ElementRef<typeof AvatarPrimitive.Root>,
	ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> & {
		trigger: TriggerProp;
	}
>(({ trigger, onClick, ...props }, ref) => {
	const { clickHandler } = useTriggerEventHandler({ trigger, onClick });
	return <Avatar ref={ref} onClick={clickHandler} {...props} />;
});

const AvatarImage = React.forwardRef<
	ElementRef<typeof AvatarPrimitive.Image>,
	ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ children, ...props }, ref) => {
	const { className, ...rootProps } = useProps("component.avatar.image", props, { as: AvatarPrimitive.Image });
	const classes = useAvatarClasses();
	return (
		<AvatarPrimitive.Image {...rootProps} className={clsx(classes.image, className)} ref={ref}>
			{children}
		</AvatarPrimitive.Image>
	);
});

const AvatarFallback = React.forwardRef<
	ElementRef<typeof AvatarPrimitive.Fallback>,
	ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback> & {
		colorize?: boolean;
	}
>(({ children, ...props }, ref) => {
	const { className, colorize, style, ...fallbackProps } = useProps("component.avatar.fallback", props, {
		as: AvatarPrimitive.Fallback,
	});
	const classes = useAvatarClasses();
	const fallbackStyle = { ...style };
	if (colorize) {
		fallbackStyle.backgroundColor = getColor(children);
	}
	return (
		<AvatarPrimitive.Fallback
			{...fallbackProps}
			style={fallbackStyle}
			className={clsx(classes.fallback, className)}
			ref={ref}
		>
			{fallbackName(children)}
		</AvatarPrimitive.Fallback>
	);
});

const AvatarFallbackIcon = React.forwardRef<
	ElementRef<typeof AvatarPrimitive.Fallback>,
	Omit<ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>, "children"> & {
		icon?: string;
	}
>(({ icon = "user", ...props }, ref) => {
	const classes = useAvatarClasses();
	return (
		<AvatarFallback ref={ref} {...props}>
			<SvgThemeIcon icon={icon} className={classes.icon} />
		</AvatarFallback>
	);
});

const AvatarBadge = React.forwardRef<
	HTMLSpanElement,
	HTMLAttributes<HTMLSpanElement> & {
		type?: AvatarBadgeType;
	}
>(({ children, ...props }, ref) => {
	const { className, type = "default", ...badgeProps } = useProps("component.avatar.badge", props, { as: "span" });
	const classes = useAvatarClasses();
	return (
		<span
			{...badgeProps}
			className={clsx(classes.badge, type === "destructive" && classes.destructive, className)}
			ref={ref}
		>
			{children}
		</span>
	);
});

const AvatarBuilder = React.forwardRef<
	HTMLSpanElement,
	ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> & {
		schema: AvatarBuilderSchema;
	}
>(({ schema, children, ...props }, ref) => {
	const { trigger, badge, icon, image, fallback, colorize } = schema;
	const child: ReactNode[] = [];
	if (badge) {
		child.push(<AvatarBadge key="badge" type={badge === true ? "default" : badge} />);
	}
	if (image) {
		child.push(<AvatarImage key="image" src={image} alt={fallback} />);
	}
	if (icon) {
		child.push(<AvatarFallbackIcon key="fallback" icon={icon === true ? "user" : icon} />);
	} else if (fallback) {
		child.push(<AvatarFallback key="fallback" colorize={colorize} />);
	}
	if (children != null) {
		child.push(React.isValidElement(children) ? React.cloneElement(children, { key: "child" }) : children);
	}
	return trigger ? (
		<AvatarTrigger ref={ref} trigger={trigger} {...props}>
			{child}
		</AvatarTrigger>
	) : (
		<Avatar ref={ref} {...props}>
			{child}
		</Avatar>
	);
});

Avatar.displayName = AvatarPrimitive.Root.displayName;
AvatarTrigger.displayName = "AvatarTrigger";
AvatarImage.displayName = AvatarPrimitive.Image.displayName;
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;
AvatarFallbackIcon.displayName = "AvatarFallbackIcon";
AvatarBadge.displayName = "AvatarBadge";
AvatarBuilder.displayName = "AvatarBuilder";

type AvatarProps = ComponentProps<typeof Avatar>;
type AvatarTriggerProps = ComponentProps<typeof AvatarTrigger>;
type AvatarImageProps = ComponentProps<typeof AvatarImage>;
type AvatarFallbackProps = ComponentProps<typeof AvatarFallback>;
type AvatarFallbackIconProps = ComponentProps<typeof AvatarFallbackIcon>;
type AvatarBadgeProps = ComponentProps<typeof AvatarBadge>;
type AvatarBuilderProps = ComponentProps<typeof AvatarBuilder>;

export { Avatar, AvatarTrigger, AvatarImage, AvatarFallback, AvatarFallbackIcon, AvatarBadge, AvatarBuilder };
export type {
	AvatarProps,
	AvatarTriggerProps,
	AvatarImageProps,
	AvatarFallbackProps,
	AvatarFallbackIconProps,
	AvatarBadgeProps,
	AvatarBuilderProps,
};
