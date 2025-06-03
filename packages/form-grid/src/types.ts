import type { FieldValues } from "react-hook-form";
import type { FormInputGroupRenderHandler } from "@tint-ui/form-input-group";
import type { z } from "zod";

/**
 * FormGridType is the interface for the form grid.
 * It contains the form name, the URL to send the form data, the method to use, the fields of the form, and the confirmation message.
 */
export interface FormGridType {
	/**
	 * The name of the form for identification.
	 */
	name: string;
	/**
	 * The URL to send the form data.
	 */
	url: string;
	/**
	 * The method to use to send the form data, default is "post".
	 */
	method?: "post" | "put" | "patch";
	/**
	 * The fields of the form.
	 */
	fields: FormGridFieldType[];
	/**
	 * The confirmation message to display checkbox for data processing consent. Adds a checkbox to the form if not false.
	 */
	confirmation?: boolean | null | string;
	/**
	 * The message to display after the form is submitted (implementation is up to the user, context contains a string but how to display the message is decided by the user).
	 */
	message?: null | string;
}

/**
 * FormGridFieldType is the interface for the form grid field.
 * It contains the name, label, type, placeholder, required, config, col, colEnd, colStart.
 */
export type FormGridFieldType<P extends object = any> = {
	/**
	 * The name of the field.
	 */
	name: string;
	/**
	 * The label of the field.
	 */
	label: string;
	/**
	 * The type of the field. Can be a built-in type or a custom type registered via adapter.
	 * Built-in types: "text", "textarea", "select", "checkbox"
	 * Custom types can be registered and override built-in types using adapters.
	 */
	type?: "text" | "textarea" | "select" | "checkbox" | "number" | "password" | "email" | string;
	/**
	 * The placeholder of the field.
	 */
	placeholder?: string | null;
	/**
	 * The required flag of the field.
	 */
	required?: boolean;
	/**
	 * The config of the field. The type of the config is determined by the type of the field.
	 */
	config?: P;
	/**
	 * The column span of the field. The default is "col-1". If the field has full flag set in config,
	 * it will always take 100% width of the form block regardless of this setting.
	 */
	col?: FormGridCol;
	/**
	 * The column end flag of the field. If true, forces a line break after this field, even if there is space available for subsequent fields.
	 */
	colEnd?: boolean;
	/**
	 * The column start flag of the field. If true, forces the field to start on a new line, even if there is available space after previous fields.
	 */
	colStart?: boolean;
};

/**
 * FormGridCol is the type for the column span of the field.
 * It contains the column span of the field. The default is "col-1". If the field has full flag set in config,
 * it will always take 100% width of the form block regardless of this setting.
 */
export type FormGridCol = "col-1" | "col-1-2" | "col-1-3" | "col-2-3";

/**
 * FormGridTriggerProps is the interface for the form grid trigger.
 * It contains the URL to send the form data, the method to use, the body of the form, the onSuccess callback, and the onError callback.
 */
export type FormGridTriggerProps = {
	/**
	 * The URL to send the form data.
	 */
	url: string;
	/**
	 * The method to use to send the form data, default is "post".
	 */
	method: "post" | "put" | "patch" | "POST" | "PUT" | "PATCH";
	/**
	 * The body of the form.
	 */
	body: FieldValues;
	/**
	 * The onSuccess callback.
	 */
	onSuccess(values?: FieldValues): void;
	/**
	 * The onError callback.
	 */
	onError(err: unknown): void;
};

/**
 * AddFormFieldAdapter is the type for the form field adapter.
 * It contains the props of the field and the render handler.
 */
export type AddFormFieldAdapter<P extends object = any> = (props: P) => FormInputGroupRenderHandler;

/**
 * AddFormFieldAdapterOptions is the interface for the form field adapter options.
 * It contains the label, help, full, createZodSchema, and createZodDefaultValue options.
 */
export interface AddFormFieldAdapterOptions {
	/**
	 * The label flag of the field. If true, the label will be displayed.
	 */
	label?: boolean;
	/**
	 * The help flag of the field. If true, the help will be displayed.
	 */
	help?: boolean;
	/**
	 * The full flag of the field. If true, the field will take 100% width of the form block.
	 */
	full?: boolean;
	/**
	 * Returns the Zod schema for the registered data type.
	 */
	createZodSchema?: (field: FormGridFieldType, values: Record<string, unknown>) => z.ZodType;
	/**
	 * Returns the default value for the registered data type.
	 */
	createZodDefaultValue?: (field: FormGridFieldType) => unknown;
}
