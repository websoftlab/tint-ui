"use client";

import type { ElementRef, ComponentPropsWithoutRef, ComponentProps, HTMLAttributes, ElementType } from "react";

import * as React from "react";
import { Command as CommandPrimitive } from "cmdk";
import clsx from "clsx";
import { SvgThemeIcon } from "@tint-ui/svg-icon";
import { useCommandClasses } from "./classes";

type PropsWithoutRef<T extends ElementType> = ComponentPropsWithoutRef<T>;

const Command = React.forwardRef<ElementRef<typeof CommandPrimitive>, PropsWithoutRef<typeof CommandPrimitive>>(
	({ className, ...props }, ref) => {
		const classes = useCommandClasses();
		return <CommandPrimitive {...props} ref={ref} className={clsx(classes.command, className)} />;
	}
);

const CommandEmpty = React.forwardRef<
	ElementRef<typeof CommandPrimitive.Empty>,
	PropsWithoutRef<typeof CommandPrimitive.Empty>
>(({ className, ...props }, ref) => {
	const classes = useCommandClasses();
	return <CommandPrimitive.Empty {...props} ref={ref} className={clsx(classes.empty, className)} />;
});

export const CommandGroup = React.forwardRef<
	ElementRef<typeof CommandPrimitive.Group>,
	PropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => {
	const classes = useCommandClasses();
	return <CommandPrimitive.Group ref={ref} className={clsx(classes.group, className)} {...props} />;
});

export const CommandInput = React.forwardRef<
	ElementRef<typeof CommandPrimitive.Input>,
	PropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className, ...props }, ref) => {
	const classes = useCommandClasses();
	return (
		<div className={classes.search} cmdk-input-wrapper="">
			<SvgThemeIcon icon="search" className={classes.icon} />
			<CommandPrimitive.Input {...props} ref={ref} className={clsx(classes.input, className)} />
		</div>
	);
});

export const CommandItem = React.forwardRef<
	ElementRef<typeof CommandPrimitive.Item>,
	PropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className, ...props }, ref) => {
	const classes = useCommandClasses();
	return <CommandPrimitive.Item ref={ref} className={clsx(classes.item, className)} {...props} />;
});

export const CommandList = React.forwardRef<
	ElementRef<typeof CommandPrimitive.List>,
	PropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, ...props }, ref) => {
	const classes = useCommandClasses();
	return <CommandPrimitive.List ref={ref} className={clsx(classes.list, className)} {...props} />;
});

export const CommandSeparator = React.forwardRef<
	ElementRef<typeof CommandPrimitive.Separator>,
	PropsWithoutRef<typeof CommandPrimitive.Separator>
>(({ className, ...props }, ref) => {
	const classes = useCommandClasses();
	return <CommandPrimitive.Separator ref={ref} className={clsx(classes.separator, className)} {...props} />;
});

export const CommandShortcut = React.forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(
	({ className, ...props }, ref) => {
		const classes = useCommandClasses();
		return <span ref={ref} className={clsx(classes.shortcut, className)} {...props} />;
	}
);

const CommandLoading = CommandPrimitive.Loading;

Command.displayName = CommandPrimitive.displayName;
CommandEmpty.displayName = CommandPrimitive.Empty.displayName;
CommandGroup.displayName = CommandPrimitive.Group.displayName;
CommandInput.displayName = CommandPrimitive.Input.displayName;
CommandItem.displayName = CommandPrimitive.Item.displayName;
CommandList.displayName = CommandPrimitive.List.displayName;
CommandSeparator.displayName = CommandPrimitive.Separator.displayName;
CommandShortcut.displayName = "CommandShortcut";

type CommandProps = ComponentProps<typeof Command>;
type CommandEmptyProps = ComponentProps<typeof CommandEmpty>;
type CommandGroupProps = ComponentProps<typeof CommandGroup>;
type CommandInputProps = ComponentProps<typeof CommandInput>;
type CommandItemProps = ComponentProps<typeof CommandItem>;
type CommandListProps = ComponentProps<typeof CommandList>;
type CommandSeparatorProps = ComponentProps<typeof CommandSeparator>;
type CommandShortcutProps = ComponentProps<typeof CommandShortcut>;
type CommandLoadingProps = ComponentProps<typeof CommandLoading>;

export { Command, CommandEmpty, CommandLoading };
export type {
	CommandProps,
	CommandEmptyProps,
	CommandGroupProps,
	CommandInputProps,
	CommandItemProps,
	CommandListProps,
	CommandSeparatorProps,
	CommandShortcutProps,
	CommandLoadingProps,
};
