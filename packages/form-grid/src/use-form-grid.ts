"use client";

import type { FieldValues } from "react-hook-form";
import type { FormGridContextType } from "./context";
import type { FormGridType } from "./types";

import * as React from "react";
import { z } from "zod";
import { useApp } from "@tint-ui/app";
import { useForm as useFormHook } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { isObject } from "@tint-ui/tools/is-plain-object";
import { createZodDefaultValue, createZodSchema } from "./form-grid-field-item";
import { useQueryTrigger } from "./use-query-trigger";

const createHash = (form: FormGridType) => {
	let hash = `${form.name}:${form.url}?`;
	hash += form.confirmation === false ? "f:" : "t:";
	for (const field of form.fields) {
		const { type = "text", name } = field;
		hash += `${name}/${type}::`;
	}
	return hash;
};

const createDefaultValues = (form: FormGridType, initialValues: Record<string, unknown> = {}) => {
	const values: Record<string, unknown> = { ...initialValues };
	for (const field of form.fields) {
		const { name } = field;
		if (values[name] != null) {
			continue;
		}
		const defaultValue = createZodDefaultValue(field);
		if (defaultValue != null) {
			values[name] = defaultValue;
		}
	}
	values.__form_confirmation = false;
	values.__form_name = form.name;
	return values;
};

const createSchema = (
	form: FormGridType,
	values: Record<string, unknown>,
	confirmationErrorMessage: string | null = null
) => {
	const object: Record<string, z.ZodType> = {};

	for (const field of form.fields) {
		object[field.name] = createZodSchema(field, values) || z.any();
	}

	if (form.confirmation !== false) {
		object.__form_confirmation = z
			.boolean()
			.default(false)
			.refine(
				(val) => val === true,
				confirmationErrorMessage ? { message: confirmationErrorMessage } : undefined
			);
	}

	return z.object(object);
};

const isErrors = (data: unknown): data is { errors: { path: (string | number)[]; message: string }[] } => {
	if (!isObject(data) || !("errors" in data)) {
		return false;
	}
	const { errors } = data;
	if (!Array.isArray(errors) || errors.length === 0) {
		return false;
	}
	const error = errors[0];
	return (
		isObject(error) &&
		"path" in error &&
		"message" in error &&
		Array.isArray(error.path) &&
		typeof error.message === "string"
	);
};

/**
 * UseFormOptions is the interface for the useFormGrid options.
 * It contains the defaultValues, trigger, and toastError options.
 */
export interface UseFormOptions {
	/**
	 * The default values for the form.
	 */
	defaultValues?: Record<string, unknown>;
	/**
	 * The trigger name to use for the form. Default is "fetch.form".
	 */
	trigger?: string;
	/**
	 * The toastError flag. If true, the error will be displayed in a toast. Default is true.
	 */
	toastError?: boolean;
}

/**
 * useFormGrid is the hook to use the form grid.
 * It returns the form grid context.
 */
export const useFormGrid = (form: FormGridType, options: UseFormOptions = {}): FormGridContextType => {
	const app = useApp();
	const hash = createHash(form);
	const { defaultValues = {}, toastError, trigger: triggerName = "fetch.form" } = options;
	const { values, schema } = React.useMemo(() => {
		const confirm = app.line("form.errors.confirmation");
		const values = createDefaultValues(form, defaultValues);
		const schema = createSchema(form, values, Array.isArray(confirm) ? confirm[0] : confirm);
		return {
			values,
			schema,
		};
	}, [hash]);

	const ctx = useFormHook({ resolver: zodResolver(schema), defaultValues: values });
	const {
		handleSubmit,
		formState: { isSubmitting },
	} = ctx;

	// api handler
	const query = useQueryTrigger(triggerName, { toastError, toastId: `form-error:${form.name}` });
	const queryHandler = ({ __form_confirmation, ...data }: FieldValues) => {
		data.__form__ = {
			confirmation: __form_confirmation,
			name: form.name,
			location: typeof location === "undefined" ? "unknown" : String(location),
		};
		return query.send(form.url, {
			method: form.method,
			body: data,
			done(values) {
				ctx.reset(values);
				ctx.clearErrors();
			},
			error(err) {
				if (isErrors(err)) {
					err.errors.forEach((item) => {
						ctx.setError(item.path.join("."), { message: item.message });
					});
				}
			},
		});
	};

	const confirmation = form.confirmation !== false;
	const isConfirm = ctx.watch("__form_confirmation");
	const disabled = isSubmitting || query.loading || (confirmation && isConfirm !== true);

	return {
		form,
		ctx,
		complete: query.complete,
		error: query.error,
		loading: query.loading,
		onReset: query.onReset,
		get message() {
			let message = form.message;
			if (!message) {
				message = app.translate("form.messages.complete", "Message sent successfully");
			}
			return message;
		},
		get confirmation() {
			return confirmation;
		},
		get confirmMessage() {
			if (typeof form.confirmation === "string") {
				return form.confirmation;
			}
			return app.translate("form.messages.confirm", "I agree with the terms of the user agreement");
		},
		disabled,
		onSubmit: handleSubmit(queryHandler),
	};
};
