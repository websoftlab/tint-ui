import type { FieldError, RegisterOptions } from "react-hook-form";

import * as React from "react";
import { useFormContext } from "react-hook-form";
import { useFormPrefix } from "./context";

export const useFormInputGroup = <T extends string = string>(
	name: T,
	inputId: string | null | undefined,
	options: RegisterOptions<Record<string, any>, T>
) => {
	const ctx = useFormContext();
	const autoId = React.useId();
	const { path } = useFormPrefix();
	const fullPath = [...path, name];
	const fullName = fullPath.join(".");

	const { disabled, ...registerOptions } = options;
	const {
		register,
		formState: { errors, isSubmitting },
	} = ctx;

	let error = errors[fullPath[0]];
	if (error && fullPath.length > 1) {
		for (let i = 1; i < fullPath.length; i++) {
			if (!error) {
				break;
			}
			error = error[fullPath[i] as keyof typeof error] as FieldError | undefined;
		}
	}

	const props = {
		required: options.required === true,
		disabled: disabled || isSubmitting,
		id: inputId || autoId,
		"aria-invalid": false,
		...register(fullName as T, registerOptions),
	};

	let invalid = false;
	let message: string | null = null;

	if (error) {
		invalid = true;
		props["aria-invalid"] = true;
		if (Array.isArray(error)) {
			error.some((item) => {
				if (item != null && typeof item.message === "string") {
					message = item.message;
					return true;
				}
			});
		} else if (typeof error.message === "string") {
			message = error.message;
		}
		if (!message) {
			message = "Invalid value";
		}
	}

	return {
		ctx,
		invalid,
		message,
		props,
	};
};
