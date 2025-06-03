"use client";

import type { FormGridFieldType, AddFormFieldAdapter, AddFormFieldAdapterOptions } from "./types";

import * as React from "react";
import { useProps } from "@tint-ui/theme";
import { FormInputGroup } from "@tint-ui/form-input-group";
import { errorMessage } from "@tint-ui/tools/error-message";
import { invariant } from "@tint-ui/tools/proof";
import { adapters as coreAdapters } from "./adapters";
import { Template } from "./template";
import { useFormGridClasses } from "./classes";

interface FormGridFieldItemProps extends React.HTMLAttributes<HTMLDivElement> {
	field: FormGridFieldType;
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

Object.entries(coreAdapters).forEach(([name, [adapter, options]]) => {
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
	const adapter = getAdapt(field);
	return adapter ? adapter.options.full === true : false;
};

const checkAdapt = (type: string) => {
	if (!type) {
		throw new Error(`Adapter type is empty`);
	}
	if (adapters.has(type)) {
		throw new Error(`The ${type} form adapter already exists`);
	}
};

/**
 * hasFormFieldAdapter is the function to check if a form field adapter exists.
 * It is used to check if a form field adapter exists in the form grid.
 */
const hasFormFieldAdapter = (type: string) => adapters.has(type);

/**
 * addFormFieldAdapter is the function to add a form field adapter.
 * It is used to add a form field adapter to the form grid.
 * Built-in adapters can be overridden, but attempting to register a custom adapter type
 * that already exists will throw an error.
 */
const addFormFieldAdapter = function <P extends object = any>(
	name: string,
	adapter: AddFormFieldAdapter<P>,
	options: AddFormFieldAdapterOptions = {}
) {
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
 */
const addFormFieldAdapterAsync = function <P extends object = any>(
	name: string,
	handler: () => Promise<{ default: AddFormFieldAdapter<P> }>,
	options: AddFormFieldAdapterOptions = {}
) {
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

	const { label = true, help = true } = adapt.options;
	const minProps = {
		themePropsType,
		className,
		label: label ? field.label : false,
		required: field.required,
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

	return (
		<FormInputGroup
			{...rest}
			{...minProps}
			themePropsType={themePropsType}
			name={field.name}
			label={label ? field.label : false}
			required={field.required}
			help={help && field.placeholder != null ? field.placeholder : undefined}
		>
			{state.adapter(field)}
		</FormInputGroup>
	);
});

FormFieldAdapterAsync.displayName = "FormFieldAdapterAsync";

const FormGridFieldItem = React.forwardRef<HTMLDivElement, FormGridFieldItemProps>((inputProps, ref) => {
	const { themePropsType } = inputProps;
	const { field, ...props } = useProps("component.form-grid.field-item", inputProps, { as: "div" });
	const classes = useFormGridClasses();
	const { type = "text" } = field;
	const adapt = adapters.get(type) || defaultAdapters.get(type);

	if (!adapt) {
		return (
			<Template
				themePropsType={themePropsType}
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

	return (
		<FormInputGroup
			{...props}
			themePropsType={themePropsType}
			name={field.name}
			label={label ? field.label : false}
			required={field.required}
			help={help && field.placeholder != null ? field.placeholder : undefined}
			ref={ref}
		>
			{adapter(field)}
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
