"use client";

import type { UseFormReturn } from "react-hook-form";
import type { FormGridSize, FormGridType } from "./types";

import * as React from "react";
import { invariant } from "@tint-ui/tools/proof";

/**
 * FormGridContextType is the interface for the form grid context.
 * It contains the form, the form context, the confirmation, the confirmMessage, the error, the message, the complete, the disabled, the loading, the onReset, and the onSubmit.
 */
interface FormGridContextType {
	/**
	 * The form grid type.
	 */
	form: FormGridType;
	/**
	 * The form context. It is a hook from react-hook-form.
	 */
	ctx: UseFormReturn;
	/**
	 * The confirmation flag. If true, the confirmation will be displayed.
	 */
	confirmation: boolean;
	/**
	 * The confirmation message.
	 */
	confirmMessage: React.ReactNode;
	/**
	 * The error message. Only used when toastError is false. Error message display implementation is handled by the user.
	 */
	error: string | null;
	/**
	 * The message to display after the form is submitted. Implementation is handled by the user.
	 */
	message: string;
	/**
	 * The complete flag. If true, the form is submitted and there are no errors.
	 */
	complete: boolean;
	/**
	 * The disabled flag. If true, the form is disabled.
	 */
	disabled: boolean;
	/**
	 * The loading flag. If true, the form is loading.
	 */
	loading: boolean;
	/**
	 * The onReset function. After successful form submission, another submission is only possible after calling this function.
	 * The complete flag is reset when this function is called.
	 */
	onReset(): void;
	/**
	 * The onSubmit function. It is a form event handler that is automatically attached to the form inside FormGrid,
	 * but can be used manually if FormGrid is not used and implemented differently.
	 */
	onSubmit: React.FormEventHandler;
}

/**
 * FormGridContext is the context for the form grid.
 * It is used to provide the form grid context to the form grid components.
 */
const FormGridContext = React.createContext<FormGridContextType | null>(null);

FormGridContext.displayName = "FormGridContext";

/**
 * useFormContext is the hook to use the form grid context.
 */
const useFormContext = (): FormGridContextType => {
	const ctx = React.useContext(FormGridContext);
	invariant(ctx, "FormGridContext is not defined");
	return ctx;
};

const FormGridSizeContext = React.createContext<FormGridSize>("md");

FormGridSizeContext.displayName = "FormGridSizeContext";

const useFormGridSize = () => {
	return React.useContext(FormGridSizeContext);
};

export { useFormContext, FormGridContext, useFormGridSize, FormGridSizeContext };
export type { FormGridContextType };
