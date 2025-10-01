"use client";

import type { HTMLAttributes, InputHTMLAttributes, MouseEventHandler, DetailedHTMLProps } from "react";
import type { InputSelectClasses } from "./classes";
import type { InputSelectProps, InputSelectSize, TagGroupProps, OptionType } from "./types";

import * as React from "react";
import clsx from "clsx";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandLoading,
} from "@tint-ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@tint-ui/popover";
import { useProps } from "@tint-ui/theme";
import { noop } from "@tint-ui/tools/noop";
import { useForkRef } from "@tint-ui/tools/use-fork-ref";
import { SvgThemeIcon } from "@tint-ui/svg-icon";
import { useSelect } from "./use-select";
import { useInputSelectClasses } from "./classes";

type ButtonSelectProps = Omit<DetailedHTMLProps<HTMLAttributes<HTMLButtonElement>, HTMLButtonElement>, "size"> & {
	clearable: boolean;
	name?: string;
	disabled?: boolean;
	invalid?: boolean;
	loading?: boolean;
	size?: InputSelectSize;
	classes: InputSelectClasses;

	onSelectOption(value: string | string[] | null): void;
};

const ButtonCancel = ({
	onClick,
	inside = false,
	disabled = false,
}: {
	inside?: boolean;
	onClick: MouseEventHandler<HTMLButtonElement>;
	disabled?: boolean;
}) => {
	const classes = useInputSelectClasses();
	const icon = <SvgThemeIcon icon="x" aria-disabled={disabled} />;
	const props = {
		className: classes.close,
		onClick: disabled ? undefined : onClick,
	};
	if (inside) {
		return (
			<span role="button" tabIndex={1} aria-disabled={disabled} {...props}>
				{icon}
			</span>
		);
	}
	return (
		<button type="button" disabled={disabled} {...props}>
			{icon}
		</button>
	);
};

ButtonCancel.displayName = "ButtonCancel";

const InputHidden = ({ name, value }: { name: string; value: null | OptionType | OptionType[] }) => {
	const classes = useInputSelectClasses();
	const { className, ...props } = useProps<
		DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>
	>("component.input-select.hidden", { name }, { as: "input" });
	return (
		<input
			{...props}
			className={clsx(classes.hidden, className)}
			type="hidden"
			name={name}
			value={value == null ? "" : Array.isArray(value) ? JSON.stringify(value) : String(value)}
		/>
	);
};

InputHidden.displayName = "InputHidden";

const Tag = ({ children, ...rest }: { children: React.ReactNode; disabled: boolean; onClick(): void }) => {
	const classes = useInputSelectClasses();
	const { className, ...tagProps } = useProps<DetailedHTMLProps<HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>>(
		"component.input-select.tag",
		{},
		{ as: "span" }
	);
	return (
		<span {...tagProps} className={clsx(classes.tag, className)}>
			{React.isValidElement(children) ? children : <span>{children}</span>}
			<ButtonCancel {...rest} />
		</span>
	);
};

Tag.displayName = "Tag";

const TagGroup = ({ children, size, ...rest }: TagGroupProps) => {
	const classes = useInputSelectClasses();
	const { className, ...groupProps } = useProps("component.input-select.tag-group", rest, { as: "div" });
	return (
		<div {...groupProps} className={clsx(classes.tags, classes[size || "md"], className)}>
			{children}
		</div>
	);
};

TagGroup.displayName = "TagGroup";

const ButtonSelect = React.forwardRef<HTMLButtonElement, ButtonSelectProps>((props, ref) => {
	const { classes, children, onSelectOption, ...restProps } = props;

	const {
		className,
		invalid,
		clearable,
		disabled = false,
		loading = false,
		size = "md",
		...buttonProps
	} = useProps("component.input-select", restProps, { as: "button" });

	const onClearHandler: MouseEventHandler<HTMLButtonElement> = React.useCallback(
		(event) => {
			event.preventDefault();
			onSelectOption(null);
		},
		[onSelectOption]
	);

	return (
		<button
			aria-invalid={invalid}
			disabled={disabled}
			type="button"
			role="combobox"
			{...buttonProps}
			className={clsx(className, classes[size], classes.select)}
			ref={ref}
		>
			<span className={classes.placeholder}>{children}</span>
			{loading ? (
				<SvgThemeIcon icon="loader" spin className={classes.loader} />
			) : (
				clearable && <ButtonCancel inside disabled={disabled} onClick={onClearHandler} />
			)}
			<SvgThemeIcon role="button" icon="selector" className={classes.selector} />
		</button>
	);
});

ButtonSelect.displayName = "ButtonSelect";

const InputSelect = React.forwardRef<HTMLButtonElement, InputSelectProps>((props, ref) => {
	const {
		options,
		lexicon,
		innerRef,
		popoverRef,
		open,
		clearable,
		popoverStyle,
		buttonProps,
		tags,
		size,
		onSelectOption,
		setOpen,
		isOptionSelected,
		renderOption,
		renderTag,
		disableSearch,
		inputController,
		error,
		loading,
		loaded,
		tagsProps,
		popoverProps,
		name,
		inputHidden,
		value,
	} = useSelect(props);

	const classes = useInputSelectClasses();
	const { disabled = false } = buttonProps;
	const forceMount = inputController != null;
	const forkRef = useForkRef(innerRef, ref);

	return (
		<>
			<Popover open={disabled ? false : open} onOpenChange={disabled ? noop : setOpen}>
				<PopoverTrigger asChild>
					<ButtonSelect
						{...buttonProps}
						name={inputHidden ? undefined : name}
						loading={loading}
						classes={classes}
						clearable={clearable}
						onSelectOption={onSelectOption}
						aria-expanded={open}
						ref={forkRef}
					>
						{lexicon.placeholder}
					</ButtonSelect>
				</PopoverTrigger>
				{tags.length > 0 && (
					<TagGroup size={size} {...tagsProps}>
						{tags.map((item) => (
							<Tag key={item.id} disabled={disabled} onClick={item.onClear}>
								{renderTag(item)}
							</Tag>
						))}
					</TagGroup>
				)}
				<PopoverContent
					{...popoverProps}
					className={clsx(classes.popover, popoverProps.className)}
					style={{ ...popoverStyle, ...popoverProps.style }}
					ref={popoverRef}
					themePropsType="input-select"
				>
					<Command>
						{disableSearch ? null : <CommandInput placeholder={lexicon.search} {...inputController} />}
						{loaded ? null : <CommandLoading>{lexicon.loading}</CommandLoading>}
						<CommandList>
							{(!forceMount || options.length === 0 || error != null) && (
								<CommandEmpty className={error == null ? undefined : classes.error}>
									{error == null ? lexicon.notFound : error}
								</CommandEmpty>
							)}
							{options.map(({ label, options }, index) => (
								<CommandGroup key={`group:${index}`} heading={label} forceMount={forceMount}>
									{options.map((item) => (
										<CommandItem
											key={item.value}
											value={`${item.value}`}
											disabled={item.disabled}
											onSelect={onSelectOption}
											aria-checked={isOptionSelected(item.value as string)}
										>
											{renderOption(item)}
											<SvgThemeIcon icon="check" className={classes.check} />
										</CommandItem>
									))}
								</CommandGroup>
							))}
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>
			{inputHidden && <InputHidden name={name!} value={value} />}
		</>
	);
});

InputSelect.displayName = "InputSelect";

export { InputSelect };
