"use client";

import type { UseFieldArrayReturn } from "react-hook-form";
import type { FormGridFieldArrayType, FormGridFieldOneOfType } from "./types";

import * as React from "react";
import clsx from "clsx";
import { useFieldArray, useFormContext } from "react-hook-form";
import { useProps } from "@tint-ui/theme";
import {
	FormPrefixProvider,
	FormInputGroupLabel,
	FormInputGroupHelper,
	useFormPrefix,
	useFormError,
} from "@tint-ui/form-input-group";
import { invariant } from "@tint-ui/tools/proof";
import { useApp } from "@tint-ui/app";
import { useFormGridClasses } from "./classes";
import { createDefaultValues } from "./create-default-values";
import { FormGridList } from "./form-grid-list";
import { ButtonIcon } from "./button-icon";

const FormGridFieldArrayEmpty = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
	({ className, ...props }, ref) => {
		const classes = useFormGridClasses();
		const array = useFormGridArrayContext();
		return (
			<div
				{...props}
				className={clsx(className, classes.box, classes.boxEmpty, array.invalid && classes.invalid)}
				ref={ref}
			>
				<div className={classes.boxCard}>
					<div className={classes.boxHeader}>
						<span className={classes.boxLabel}>{array.field.label}</span>
						<ButtonIcon
							themePropsType={array.themePropsType}
							icon="plus"
							disabled={array.disabled || !array.additional}
							onClick={() => {
								array.add();
							}}
						/>
					</div>
				</div>
				{array.invalid && array.errorMessage != null && (
					<FormInputGroupHelper className={classes.helper}>{array.errorMessage}</FormInputGroupHelper>
				)}
			</div>
		);
	}
);

FormGridFieldArrayEmpty.displayName = "FormGridFieldArrayEmpty";

const FormGridFieldArrayHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
	({ className, ...props }, ref) => {
		const classes = useFormGridClasses();
		const array = useFormGridArrayContext();
		const ctx = useFormContext();
		const { index, id: itemId, isLast } = useFormGridFieldArrayItemContext();
		const { prefix } = useFormPrefix();
		const idx = index + 1;
		const open = array.isOpen(itemId);
		const { disabled } = array;

		let labelName = array.labelName;
		let label: string | number | null = null;
		if (labelName) {
			if (prefix) {
				labelName = `${prefix}.${labelName}`;
			}
			label = ctx.watch(labelName);
		}

		label = String(label || "").trim();
		if (!label) {
			label = array.createItemLabel(idx);
		}

		return (
			<div {...props} className={clsx(className, classes.boxHeader)} ref={ref}>
				{array.collapsible && (
					<ButtonIcon
						themePropsType={array.themePropsType}
						variant="ghost"
						icon={open ? "item-collapse" : "item-expand"}
						disabled={disabled}
						onClick={() => {
							array.onOpenToggle(itemId);
						}}
					/>
				)}
				<span className={classes.boxLabel}>{label}</span>
				{array.movable && !isLast && (
					<ButtonIcon
						themePropsType={array.themePropsType}
						icon="arrow-down"
						disabled={disabled}
						onClick={() => {
							array.down(index);
						}}
					/>
				)}
				{array.additional && (
					<ButtonIcon
						themePropsType={array.themePropsType}
						icon="plus"
						disabled={disabled}
						onClick={() => {
							array.add(index);
						}}
					/>
				)}
				{array.removable && (
					<ButtonIcon
						themePropsType={array.themePropsType}
						icon="x"
						variant="destructive"
						disabled={disabled}
						onClick={() => {
							array.remove(index);
						}}
					/>
				)}
			</div>
		);
	}
);

FormGridFieldArrayHeader.displayName = "FormGridFieldArrayHeader";

const getLabelName = (labelName: string | null | undefined, fields: FormGridFieldOneOfType[]) => {
	if (labelName != null) {
		return labelName;
	}
	let textArea: string | null = null;
	for (const { type, name } of fields) {
		if (!type || type === "text") {
			return name;
		}
		if (textArea == null && type === "textarea") {
			textArea = name;
		}
	}
	return textArea;
};

type FormGridFieldArrayItemContextType = {
	index: number;
	id: string;
	isFirst: boolean;
	isLast: boolean;
};

const FormGridFieldArrayItemContext = React.createContext<null | FormGridFieldArrayItemContextType>(null);

FormGridFieldArrayItemContext.displayName = "FormGridFieldArrayItemContext";

const useFormGridFieldArrayItemContext = () => {
	const ctx = React.useContext(FormGridFieldArrayItemContext);
	invariant(ctx, "FormGridFieldArrayItemContext is not defined");
	return ctx;
};

const FormGridFieldArrayItem = ({ itemIndex }: { itemIndex: number }) => {
	const classes = useFormGridClasses();
	const array = useFormGridArrayContext();
	const itemId = array.fields[itemIndex][array.keyName as "id"];
	const [invalid, errorMessage] = useFormError(itemIndex);
	const open = array.useOpen(itemId);
	const { fields, rules } = array.field;
	const itemType: FormGridFieldArrayItemContextType = {
		index: itemIndex,
		id: itemId,
		isFirst: itemIndex === 0,
		isLast: itemIndex + 1 === array.fields.length,
	};
	return (
		<FormGridFieldArrayItemContext.Provider value={itemType}>
			<div className={clsx(classes.boxArrayItem, invalid && classes.invalid)}>
				<div className={classes.boxCard}>
					<FormPrefixProvider value={itemIndex}>
						<FormGridFieldArrayHeader />
						{open && (
							<div className={classes.content}>
								<FormGridList
									disabled={array.disabled}
									themePropsType={array.themePropsType}
									fields={fields}
									rules={rules}
								/>
							</div>
						)}
					</FormPrefixProvider>
				</div>
				{invalid && errorMessage != null && (
					<FormInputGroupHelper className={classes.helper} themePropsType={array.themePropsType}>
						{errorMessage}
					</FormInputGroupHelper>
				)}
			</div>
		</FormGridFieldArrayItemContext.Provider>
	);
};

FormGridFieldArrayItem.displayName = "FormGridFieldArrayItem";

type FormGridArrayContextType = UseFieldArrayReturn & {
	field: FormGridFieldArrayType;
	invalid: boolean;
	errorMessage: string | null;
	length: number;
	name: string;
	keyName: string;
	labelName: string | null;
	additional: boolean;
	removable: boolean;
	collapsible: boolean;
	movable: boolean;
	disabled: boolean;
	themePropsType: string | undefined;
	add(index?: number): void;
	down(index: number): void;
	isOpen(id: string): boolean;
	onOpenToggle(id: string): void;
	useOpen(id: string): boolean;
	createItemLabel(position: number): string;
};

const FormGridArrayContext = React.createContext<null | FormGridArrayContextType>(null);

const useFormGridArrayContext = () => {
	const ctx = React.useContext(FormGridArrayContext);
	invariant(ctx, "FormGridArrayContext is not defined");
	return ctx;
};

FormGridArrayContext.displayName = "FormGridArrayContext";

const FormGridArrayContextProvider = ({
	value,
	children,
}: {
	value: FormGridArrayContextType;
	children: React.ReactNode;
}) => {
	return (
		<FormGridArrayContext.Provider value={value}>
			<FormPrefixProvider value={value.field.name}>{children}</FormPrefixProvider>
		</FormGridArrayContext.Provider>
	);
};

FormGridArrayContextProvider.displayName = "FormGridArrayContextProvider";

const createState = (
	fields: Record<string, string>[],
	keyName: string,
	collapsible: boolean,
	prevState: Record<string, boolean | undefined> = {},
	lastIndex: number | null = null
): { update: string[]; state: Record<string, boolean> } => {
	const state: Record<string, boolean> = {};
	const update: string[] = [];
	fields.forEach((values, index) => {
		const id = values[keyName];
		let value: boolean;
		if (!collapsible) {
			value = true;
		} else {
			if (lastIndex === index) {
				value = true;
			} else if (prevState.hasOwnProperty(id)) {
				value = prevState[id] as boolean;
			} else {
				value = false;
			}
			if (value !== prevState[id]) {
				update.push(id);
			}
		}
		state[id] = value;
	});
	return { update, state };
};

const openEmit = (
	listeners: Record<string, Set<(value: boolean) => void>>,
	state: Record<string, boolean | undefined>,
	keys: string[]
) => {
	for (const key of keys) {
		const listener = listeners[key];
		if (!listener || !listener.size) {
			continue;
		}
		const value = state[key];
		if (typeof value !== "boolean") {
			return;
		}
		for (const handler of listener.values()) {
			handler(value);
		}
	}
};

const useFormGridArray = (
	field: FormGridFieldArrayType,
	{
		disabled = false,
		removable: removableProp = true,
		themePropsType,
	}: { disabled?: boolean; removable?: boolean; themePropsType?: string } = {}
): FormGridArrayContextType => {
	const { prefix } = useFormPrefix();
	const {
		name,
		labelName: originLabelName,
		fields: schemaFields,
		collapsible = schemaFields.length > 3,
		readOnly = false,
		itemLabel,
		max,
	} = field;

	let { min } = field;
	if (!removableProp && (!min || min < 1)) {
		min = 1;
	}

	const fullName = prefix ? `${prefix}.${name}` : name;
	const { control } = useFormContext();
	const [invalid, errorMessage] = useFormError(name);
	const labelName = React.useMemo(() => getLabelName(originLabelName, schemaFields), [originLabelName, schemaFields]);
	const keyName = field.keyName || "id";
	const ctx = useFieldArray({ control, name: fullName, keyName });
	const ctxRef = React.useRef(ctx);
	ctxRef.current = ctx;

	const { fields } = ctx;
	const length = fields.length;

	const openRef = React.useRef<{
		last: number;
		length: number;
		collapsible: boolean;
		listeners: Record<string, Set<(value: boolean) => void>>;
		state: Record<string, boolean | undefined>;
	}>({
		last: -1,
		length: -1,
		collapsible,
		listeners: {},
		state: {},
	});

	const app = useApp();
	const createItemLabel = React.useCallback(
		(position: number) => {
			if (typeof itemLabel === "function") {
				return itemLabel({ position });
			}
			if (itemLabel) {
				return app.replace(itemLabel, { position });
			}
			return `Item #${position}`;
		},
		[app, itemLabel]
	);

	const add = React.useCallback(
		(index: number = -1) => {
			const values = createDefaultValues(schemaFields);
			const ctx = ctxRef.current;
			if (index === -1) {
				ctx.prepend(values, { focusIndex: 0 });
				openRef.current.last = 0;
			} else {
				const length = ctx.fields.length;
				const next = index + 1;
				openRef.current.last = next;
				if (length === next) {
					ctx.append(values, { focusIndex: next });
				} else {
					ctx.insert(next, values, { focusIndex: next });
				}
			}
		},
		[schemaFields]
	);

	openRef.current.collapsible = collapsible;
	if (openRef.current.length === -1) {
		openRef.current.length = length;
		openRef.current.state = createState(ctx.fields, keyName, collapsible).state;
	} else if (openRef.current.length !== length) {
		const last = openRef.current.last;
		if (last !== -1) {
			const id = fields[last]?.[keyName];
			if (id) {
				openRef.current.state[id] = true;
			}
		}
		openRef.current.length = length;
		openRef.current.last = -1;
	}

	const hash = fields.reduce((previousValue, currentValue) => `${previousValue}:${currentValue[keyName]}:`, "");
	React.useEffect(() => {
		const ctx = ctxRef.current;
		const open = openRef.current;

		let last: number | null = null;
		if (open.length !== ctx.fields.length && open.last !== -1) {
			last = open.last;
			open.last = -1;
		}

		const { state, update } = createState(ctx.fields, keyName, collapsible, open.state, last);
		open.state = state;
		if (update.length) {
			openEmit(open.listeners, open.state, update);
		}
	}, [hash, keyName, collapsible]);

	const { down, isOpen, onOpenToggle, useOpen } = React.useMemo(() => {
		const isOpen = (id: string) => {
			const ref = openRef.current;
			if (!ref.collapsible) {
				return true;
			}
			return ref.state[id] === true;
		};
		return {
			down(from: number) {
				const ctx = ctxRef.current;
				const to = from + 1;
				const length = ctx.fields.length;
				if (from >= 0 && to < length) {
					ctx.swap(from, to);
				}
			},
			isOpen,
			onOpenToggle(id: string) {
				const ref = openRef.current;
				if (!ref.collapsible) {
					return;
				}
				ref.state[id] = !ref.state[id];
				openEmit(ref.listeners, ref.state, [id]);
			},
			useOpen(id: string) {
				const [open, setOpen] = React.useState(() => isOpen(id));
				React.useEffect(() => {
					const ref = openRef.current;
					if (!ref.listeners.hasOwnProperty(id)) {
						ref.listeners[id] = new Set();
					}
					ref.listeners[id].add(setOpen);
					return () => {
						if (ref.listeners.hasOwnProperty(id)) {
							ref.listeners[id].delete(setOpen);
							if (ref.listeners[id].size === 0) {
								delete ref.listeners[id];
							}
						}
					};
				}, [id]);
				return open;
			},
		};
	}, []);

	const lock = disabled || readOnly;
	const additional = !lock && (!max || length < max);
	const removable = !lock && (!min || length > min);
	const movable = !lock && field.movable !== false;

	return {
		...ctx,
		disabled,
		themePropsType,
		isOpen,
		onOpenToggle,
		useOpen,
		invalid,
		errorMessage,
		length,
		keyName,
		additional,
		removable,
		movable,
		collapsible,
		name: fullName,
		add,
		down,
		labelName,
		createItemLabel,
		field,
	};
};

const FormGridFieldArray = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement> & {
		field: FormGridFieldArrayType;
		disabled?: boolean;
		themePropsType?: string;
		removable?: boolean;
	}
>((inputProps, ref) => {
	const { themePropsType } = inputProps;
	const {
		field,
		className,
		disabled = false,
		removable,
		...props
	} = useProps("component.form-grid.field-array", inputProps, {
		as: "div",
	});

	const array = useFormGridArray(field, { disabled, removable, themePropsType });
	const { fields, length, keyName } = array;
	const classes = useFormGridClasses();

	if (length === 0) {
		return (
			<FormGridArrayContextProvider value={array}>
				<FormGridFieldArrayEmpty {...props} ref={ref} />
			</FormGridArrayContextProvider>
		);
	}

	return (
		<FormGridArrayContextProvider value={array}>
			<div {...props} className={clsx(className, classes.box, array.invalid && classes.invalid)} ref={ref}>
				{field.labelHidden ? null : (
					<FormInputGroupLabel className={classes.label} themePropsType={themePropsType}>
						{field.label}
					</FormInputGroupLabel>
				)}
				<div className={classes.boxArrayList}>
					{fields.map((item, index) => (
						<FormGridFieldArrayItem key={item[keyName as "id"]} itemIndex={index} />
					))}
				</div>
				{array.invalid && array.errorMessage != null && (
					<FormInputGroupHelper className={classes.helper} themePropsType={themePropsType}>
						{array.errorMessage}
					</FormInputGroupHelper>
				)}
			</div>
		</FormGridArrayContextProvider>
	);
});

FormGridFieldArray.displayName = "FormGridFieldArray";

type FormGridFieldArrayProps = React.ComponentProps<typeof FormGridFieldArray>;

export { FormGridFieldArray };
export type { FormGridFieldArrayProps };
