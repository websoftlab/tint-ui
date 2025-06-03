"use client";

import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { SvgThemeIcon } from "@tint-ui/svg-icon";
import clsx from "clsx";
import { useDropdownMenuClasses } from "./classes";

const DropdownMenu = DropdownMenuPrimitive.Root;

const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

const DropdownMenuGroup = DropdownMenuPrimitive.Group;

const DropdownMenuPortal = DropdownMenuPrimitive.Portal;

const DropdownMenuSub = DropdownMenuPrimitive.Sub;

const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

const DropdownMenuSubTrigger = React.forwardRef<
	React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
	React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> & {
		inset?: boolean;
	}
>(({ className, inset, children, ...props }, ref) => {
	const classes = useDropdownMenuClasses();
	return (
		<DropdownMenuPrimitive.SubTrigger
			ref={ref}
			className={clsx(classes.subTrigger, inset && classes.inset, className)}
			{...props}
		>
			{children}
			<SvgThemeIcon icon="chevron-right" className={classes.iconRight} />
		</DropdownMenuPrimitive.SubTrigger>
	);
});

const DropdownMenuSubContent = React.forwardRef<
	React.ElementRef<typeof DropdownMenuPrimitive.SubContent>,
	React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => {
	const classes = useDropdownMenuClasses();
	return <DropdownMenuPrimitive.SubContent ref={ref} className={clsx(classes.subContent, className)} {...props} />;
});

const DropdownMenuContent = React.forwardRef<
	React.ElementRef<typeof DropdownMenuPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => {
	const classes = useDropdownMenuClasses();
	return (
		<DropdownMenuPrimitive.Portal>
			<DropdownMenuPrimitive.Content
				ref={ref}
				sideOffset={sideOffset}
				className={clsx(classes.content, className)}
				{...props}
			/>
		</DropdownMenuPrimitive.Portal>
	);
});

const DropdownMenuItem = React.forwardRef<
	React.ElementRef<typeof DropdownMenuPrimitive.Item>,
	React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
		inset?: boolean;
	}
>(({ className, inset, ...props }, ref) => {
	const classes = useDropdownMenuClasses();
	return (
		<DropdownMenuPrimitive.Item
			ref={ref}
			className={clsx(classes.item, inset && classes.inset, className)}
			{...props}
		/>
	);
});

const DropdownMenuCheckboxItem = React.forwardRef<
	React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
	React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => {
	const classes = useDropdownMenuClasses();
	return (
		<DropdownMenuPrimitive.CheckboxItem
			ref={ref}
			className={clsx(classes.checkboxItem, className)}
			checked={checked}
			{...props}
		>
			<span className={classes.checker}>
				<DropdownMenuPrimitive.ItemIndicator>
					<SvgThemeIcon icon="check" className={classes.iconCheck} />
				</DropdownMenuPrimitive.ItemIndicator>
			</span>
			{children}
		</DropdownMenuPrimitive.CheckboxItem>
	);
});

const DropdownMenuRadioItem = React.forwardRef<
	React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
	React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => {
	const classes = useDropdownMenuClasses();
	return (
		<DropdownMenuPrimitive.RadioItem ref={ref} className={clsx(classes.radioItem, className)} {...props}>
			<span className={classes.checker}>
				<DropdownMenuPrimitive.ItemIndicator>
					<SvgThemeIcon icon="circle" className={classes.iconCircle} />
				</DropdownMenuPrimitive.ItemIndicator>
			</span>
			{children}
		</DropdownMenuPrimitive.RadioItem>
	);
});

const DropdownMenuLabel = React.forwardRef<
	React.ElementRef<typeof DropdownMenuPrimitive.Label>,
	React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & {
		inset?: boolean;
	}
>(({ className, inset, ...props }, ref) => {
	const classes = useDropdownMenuClasses();
	return (
		<DropdownMenuPrimitive.Label
			ref={ref}
			className={clsx(classes.label, inset && classes.inset, className)}
			{...props}
		/>
	);
});

const DropdownMenuSeparator = React.forwardRef<
	React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
	React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => {
	const classes = useDropdownMenuClasses();
	return <DropdownMenuPrimitive.Separator ref={ref} className={clsx(classes.separator, className)} {...props} />;
});

const DropdownMenuShortcut = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => {
	const classes = useDropdownMenuClasses();
	return <span className={clsx(classes.shortcut, className)} {...props} />;
};

// ---

DropdownMenuSubTrigger.displayName = DropdownMenuPrimitive.SubTrigger.displayName;
DropdownMenuSubContent.displayName = DropdownMenuPrimitive.SubContent.displayName;
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;
DropdownMenuCheckboxItem.displayName = DropdownMenuPrimitive.CheckboxItem.displayName;
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName;
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName;
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName;
DropdownMenuShortcut.displayName = "DropdownMenuShortcut";

export {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuCheckboxItem,
	DropdownMenuRadioItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuGroup,
	DropdownMenuPortal,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuRadioGroup,
};
