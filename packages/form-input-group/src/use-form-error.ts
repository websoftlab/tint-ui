"use client";

import type { FieldError } from "react-hook-form";

import { useFormContext } from "react-hook-form";
import { useFormPrefix } from "@tint-ui/form-input-group";
import { isObject } from "@tint-ui/tools/is-plain-object";

const useFormError = (name?: string | number): [boolean, string | null] => {
	const {
		formState: { errors },
	} = useFormContext();
	const { path } = useFormPrefix();
	const rootPath = name == null ? path : [...path, name];

	let error = rootPath.length ? errors[rootPath[0]] : undefined;
	if (error && rootPath.length > 1) {
		for (let i = 1; i < rootPath.length; i++) {
			if (!error) {
				break;
			}
			error = error[rootPath[i] as keyof typeof error] as FieldError | undefined;
		}
	}

	const invalid = error != null;
	let errorMessage: string | null = null;
	if (error) {
		if (typeof error === "string") {
			errorMessage = error;
		} else if ("message" in error) {
			errorMessage = error.message as string;
		} else if ("root" in error && isObject(error.root) && "message" in error.root) {
			errorMessage = error.root.message as string;
		}
	}

	return [invalid, errorMessage];
};

export { useFormError };
