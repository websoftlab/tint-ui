"use client";

import type { FormGridFieldType, FormGridCol, AddFormFieldAdapter, AddFormFieldAdapterOptions } from "./types";

import * as React from "react";
import { useFormContext } from "react-hook-form";
import { useProps } from "@tint-ui/theme";
import { FormInputGroup } from "@tint-ui/form-input-group";
import { errorMessage } from "@tint-ui/tools/error-message";
import { invariant } from "@tint-ui/tools/proof";
import { adapters as coreAdapters } from "./adapters";
import { Template } from "./template";
import { useFormGridClasses } from "./classes";
import clsx from "clsx";

interface FormGridFieldItemProps extends React.HTMLAttributes<HTMLDivElement> {
	field: FormGridFieldType;
	col?: FormGridCol;
	disabled?: boolean;
	themePropsType?: string;
}

type AdaptSync = {
	sync: true;
	adapter: AddFormFieldAdapter;
	options: AddFormFieldAdapterOptions;
};

type AdaptAsync = {
	sync: false;
	error: string | null;
	handler: () => Promise<{ default: AddFormFieldAdapter }>;
	promise: Promise<void> | null;
	adapter: AddFormFieldAdapter | null;
	waiters: Set<(event: AdaptAsyncEvent) => void>;
	options: AddFormFieldAdapterOptions;
};

type AdaptAsyncEvent = { error: string } | { adapter: AddFormFieldAdapter };

const adapters = new Map<string, AdaptSync | AdaptAsync>();
const defaultAdapters = new Map<string, AdaptSync>();

Object.entries(coreAdapters).forEach(([name, { adapter, options }]) => {
	defaultAdapters.set(name, {
		sync: true,
		adapter,
		options,
	});
});

const getAdapt = (field: FormGridFieldType) => {
	const { type = "text" } = field;
	const adapter = adapters.get(type) || defaultAdapters.get(type);
	if (!adapter) {
		return null;
	}
	return adapter;
};

const createZodSchema = (field: FormGridFieldType, values: Record<string, unknown>) => {
	const adapter = getAdapt(field);
	if (!adapter) {
		return null;
	}
	const { createZodSchema } = adapter.options;
	if (typeof createZodSchema !== "function") {
		return null;
	}
	return createZodSchema(field, values);
};

const createZodDefaultValue = (field: FormGridFieldType): unknown => {
	const { defaultValue } = field.config || {};
	if (defaultValue != null) {
		return defaultValue;
	}
	const adapter = getAdapt(field);
	if (!adapter) {
		return null;
	}
	const { createZodDefaultValue } = adapter.options;
	if (typeof createZodDefaultValue !== "function") {
		return null;
	}
	return createZodDefaultValue(field);
};

const isFullFieldType = (field: FormGridFieldType) => {
	if (field.type === "array" || field.type === "object") {
		return true;
	}
	const adapter = getAdapt(field);
	return adapter ? adapter.options.full === true : false;
};

const privateTypes = ["hidden", "array", "object"];

const checkAdapt = (type: string) => {
	if (!type) {
		throw new Error(`Adapter type is empty`);
	}
	if (privateTypes.includes(type)) {
		throw new Error(`The ${type} type is private`);
	}
	if (adapters.has(type)) {
		throw new Error(`The ${type} form adapter already exists`);
	}
};

/**
 * hasFormFieldAdapter is the function to check if a form field adapter exists.
 * It is used to check if a form field adapter exists in the form grid.
 *
 * @param {string} type - The name of the form field adapter to check.
 * @returns {boolean} - Returns true if the form field adapter exists, false otherwise.
 */
const hasFormFieldAdapter = (type: string): boolean => adapters.has(type);

/**
 * addFormFieldAdapter is the function to add a form field adapter.
 * It is used to add a form field adapter to the form grid.
 * Built-in adapters can be overridden, but attempting to register a custom adapter type
 * that already exists will throw an error.
 *
 * @template P - Parameters that will be passed to the adapter.
 * @param {string} name - The name of the form field adapter to add.
 * @param {AddFormFieldAdapter<P>} adapter - The adapter function to add.
 * @param {AddFormFieldAdapterOptions} options - The options for the form field adapter.
 * @returns {void}
 */
const addFormFieldAdapter = function <P extends object = any>(
	name: string,
	adapter: AddFormFieldAdapter<P>,
	options: AddFormFieldAdapterOptions = {}
): void {
	checkAdapt(name);
	adapters.set(name, {
		sync: true,
		adapter,
		options,
	});
};

/**
 * addFormFieldAdapterAsync is the function to add an asynchronous form field adapter.
 * It is used to add an asynchronous form field adapter to the form grid.
 * Built-in adapters can be overridden, but attempting to register a custom adapter type
 * that already exists will throw an error.
 *
 * @template P - Parameters that will be passed to the adapter.
 * @param {string} name - The name of the form field adapter to add.
 * @param {() => Promise<{ default: AddFormFieldAdapter<P> }>} handler - The handler function to add the form field adapter.
 * @param {AddFormFieldAdapterOptions} options - The options for the form field adapter.
 * @returns {void}
 */
const addFormFieldAdapterAsync = function <P extends object = any>(
	name: string,
	handler: () => Promise<{ default: AddFormFieldAdapter<P> }>,
	options: AddFormFieldAdapterOptions = {}
): void {
	checkAdapt(name);
	adapters.set(name, {
		sync: false,
		handler,
		adapter: null,
		options,
		error: null,
		promise: null,
		waiters: new Set(),
	});
};

const getAdapter = (type: string, result: { default: AddFormFieldAdapter }) => {
	const adapter = result?.default;
	invariant(typeof adapter === "function", `Async ${type} adapter failure: default is not function`);
	return adapter;
};

const createAsyncPromise = async (type: string, adapt: AdaptAsync) => {
	try {
		const result = await adapt.handler();
		const adapter = getAdapter(type, result);
		adapt.error = null;
		adapt.adapter = adapter;
		adapters.set(type, {
			sync: true,
			adapter,
			options: adapt.options,
		});
	} catch (err) {
		adapt.error = errorMessage(err).message;
	}

	let event: AdaptAsyncEvent;
	if (adapt.error != null) {
		event = { error: adapt.error };
	} else if (adapt.adapter) {
		event = { adapter: adapt.adapter };
	} else {
		return;
	}

	const handlers = Array.from(adapt.waiters.values());
	adapt.waiters.clear();

	handlers.forEach((handler) => {
		handler(event);
	});
};

const FormFieldAdapterAsync = React.forwardRef<
	HTMLDivElement,
	FormGridFieldItemProps & { adapt: AdaptAsync; themePropsType?: string }
>((props, ref) => {
	const ctx = useFormContext();
	const classes = useFormGridClasses();
	const { adapt, field, className, themePropsType, ...rest } = props;
	const [state, setState] = React.useState<null | AdaptAsyncEvent>(() => {
		return adapt.adapter ? { adapter: adapt.adapter } : adapt.error != null ? { error: adapt.error } : null;
	});

	React.useEffect(() => {
		const { adapter, error, promise } = adapt;
		if (error != null || adapter != null) {
			return;
		}
		if (promise == null) {
			const { type = "text" } = field;
			adapt.promise = createAsyncPromise(type, adapt);
		}
		adapt.waiters.add(setState);
		return () => {
			adapt.waiters.delete(setState);
		};
	}, [adapt]);

	// ignore type
	if (field.type === "hidden") {
		return null;
	}

	const { label = true, help = true } = adapt.options;
	const fieldType = field.type || "text";
	const minProps = {
		themePropsType,
		className,
		label: label ? field.label : false,
		required: field.required,
		"data-field-type": fieldType,
		ref,
	};

	if (state == null) {
		return (
			<Template {...minProps}>
				<div className={classes.loader} />
			</Template>
		);
	}

	if ("error" in state) {
		return (
			<Template {...minProps}>
				<div className={classes.error}>{state.error}</div>
			</Template>
		);
	}

	const handler = state.adapter(field, ctx);
	if ("__virtual" in handler) {
		return <handler.__virtual data-field-type={fieldType} className={className} ref={ref} />;
	}

	return (
		<FormInputGroup
			{...rest}
			{...minProps}
			themePropsType={themePropsType}
			name={field.name}
			label={label ? field.label : false}
			required={field.required}
			help={help && field.help != null ? field.help : undefined}
		>
			{handler}
		</FormInputGroup>
	);
});

FormFieldAdapterAsync.displayName = "FormFieldAdapterAsync";

const sizeKeys: Record<FormGridCol, "n1" | "n1x2" | "n1x3" | "n2x3"> = {
	"col-1": "n1",
	"col-1-2": "n1x2",
	"col-1-3": "n1x3",
	"col-2-3": "n2x3",
};

const FormGridFieldItem = React.forwardRef<HTMLDivElement, FormGridFieldItemProps>((inputProps, ref) => {
	const { themePropsType } = inputProps;
	const ctx = useFormContext();
	const { field, col, ...props } = useProps("component.form-grid.field-item", inputProps, { as: "div" });
	const classes = useFormGridClasses();

	if (col) {
		props.className = clsx(props.className, classes[sizeKeys[col]]);
	}

	if (field.disabled === true) {
		props.disabled = true;
	}

	const { type = "text" } = field;
	const adapt = adapters.get(type) || defaultAdapters.get(type);

	if (!adapt) {
		return (
			<Template
				themePropsType={themePropsType}
				data-field-type={type}
				className={props.className}
				label={field.label}
				required={field.required}
				ref={ref}
			>
				<div className={classes.error}>{`The "${type}" field type not found`}</div>
			</Template>
		);
	}

	if (!adapt.sync) {
		return (
			<FormFieldAdapterAsync {...props} themePropsType={themePropsType} field={field} adapt={adapt} ref={ref} />
		);
	}

	const {
		adapter,
		options: { label = true, help = true },
	} = adapt;

	const handler = adapter(field, ctx);
	if ("__virtual" in handler) {
		return <handler.__virtual data-field-type={type} className={props.className} ref={ref} />;
	}

	return (
		<FormInputGroup
			{...props}
			data-field-type={type}
			themePropsType={themePropsType}
			name={field.name}
			label={label ? field.label : false}
			required={field.required}
			help={help && field.help != null ? field.help : undefined}
			ref={ref}
		>
			{handler}
		</FormInputGroup>
	);
});

FormGridFieldItem.displayName = "FormGridFieldItem";

export {
	FormGridFieldItem,
	addFormFieldAdapter,
	addFormFieldAdapterAsync,
	hasFormFieldAdapter,
	createZodSchema,
	createZodDefaultValue,
	isFullFieldType,
};
export type { FormGridFieldItemProps };
