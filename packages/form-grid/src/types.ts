import * as React from "react";
import type { FieldValues, UseFormReturn } from "react-hook-form";
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
	fields: FormGridFieldOneOfType[];
	/**
	 * The rules of the form fields.
	 */
	rules?: Record<string, FormGridThenRule>;
	/**
	 * The confirmation message to display checkbox for data processing consent. Adds a checkbox to the form if not false.
	 */
	confirmation?: boolean | null | string | (() => React.ReactNode);
	/**
	 * The message to display after the form is submitted (implementation is up to the user, context contains a string but how to display the message is decided by the user).
	 */
	message?: null | string;
}

export type FormGridFieldOneOfType =
	| FormGridFieldType
	| FormGridFieldHiddenType
	| FormGridFieldArrayType
	| FormGridFieldObjectType;

export type FormGridFieldOneOfDisplayType = FormGridFieldType | FormGridFieldArrayType | FormGridFieldObjectType;

/**
 * FormGridFieldHiddenType is the interface for the form grid field hidden type.
 * It contains the name, type, and defaultValue.
 */
export type FormGridFieldHiddenType<T = unknown> = {
	/**
	 * The name of the field.
	 */
	name: string;
	/**
	 * The type of the field. Always "hidden".
	 */
	type: "hidden";
	/**
	 * The default value of the field. Value is not will be validated and included as is in the form data.
	 */
	defaultValue?: T;
};

export type FormGridFieldArrayType = Pick<
	FormGridFieldType<{}>,
	"name" | "label" | "readOnly" | "help" | "disabled" | "heading"
> &
	Pick<FormGridType, "rules" | "fields"> & {
		/**
		 * The type of the field. Always "object".
		 */
		type: "array";
		/**
		 * The minimum number of items in the array.
		 */
		min?: number;
		/**
		 * The maximum number of items in the array.
		 */
		max?: number;
		/**
		 * The movable flag of the array group. If true, items inside the array can be reordered.
		 */
		movable?: boolean;

		keyName?: string;

		labelName?: string;

		itemLabel?: string | ((data: { position: number }) => string);

		labelHidden?: boolean;
		/**
		 * The collapsible flag of the array group. If true, the array group will be displayed as a collapsible section.
		 */
		collapsible?: boolean;
	};

export type FormGridFieldObjectType = Pick<
	FormGridFieldType<{}>,
	"name" | "label" | "readOnly" | "help" | "disabled" | "required" | "heading"
> &
	Pick<FormGridType, "rules" | "fields"> & {
		/**
		 * The type of the field. Always "object".
		 */
		type: "object";

		collapsible?: boolean;

		modal?: boolean;
	};

export type FormGridThenOperator =
	| "eq"
	| "lt"
	| "lte"
	| "gt"
	| "gte"
	| "not"
	| "include"
	| "not-include"
	| "is-empty"
	| "not-empty"
	| "is-null"
	| "not-null";

export type FormGridThenArrayOperator = "in" | "not-in";

export type FormGridThenRule =
	| {
			name: string;
			operator?: FormGridThenOperator;
			value?: string | number | boolean;
			required?: boolean;
	  }
	| {
			name: string;
			operator: FormGridThenArrayOperator;
			value: unknown[];
			required?: boolean;
	  };

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
	 * The help of the field.
	 */
	help?: string | null;
	/**
	 * The placeholder of the field.
	 */
	placeholder?: string | null;
	/**
	 * The required flag of the field.
	 */
	required?: boolean;
	/**
	 * The readOnly flag of the field.
	 */
	readOnly?: boolean;
	/**
	 * The disabled flag of the field.
	 */
	disabled?: boolean;
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
	/**
	 * The header of the field group. If set, the field will be displayed as a group with the header.
	 */
	heading?: FormGridGroupHeading | string | null;
};

/**
 * FormGridCol is the type for the column span of the field.
 * It contains the column span of the field. The default is "col-1". If the field has full flag set in config,
 * it will always take 100% width of the form block regardless of this setting.
 */
export type FormGridCol = "col-1" | "col-1-2" | "col-1-3" | "col-2-3";

export type FormGridGroupCol = {
	col: FormGridCol;
	field: FormGridFieldOneOfDisplayType;
};

export type FormGridGroupHeading = {
	heading: string;
	id?: string;
};

export type FormGridSize = "sm" | "md" | "lg";

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
export type AddFormFieldAdapter<P extends object = any> = (
	field: FormGridFieldType<P>,
	ctx: UseFormReturn
) => FormInputGroupRenderHandler | { __virtual: React.ElementType };

export type CreateZodSchemaCallback<P extends object = any> = (
	field: FormGridFieldType<P>,
	values: Record<string, unknown>
) => z.ZodType;

export type CreateZodDefaultValueCallback<P extends object = any> = (field: FormGridFieldType<P>) => unknown;

/**
 * AddFormFieldAdapterOptions is the interface for the form field adapter options.
 * It contains the label, help, full, createZodSchema, and createZodDefaultValue options.
 */
export type AddFormFieldAdapterOptions = {
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
	createZodSchema?: CreateZodSchemaCallback | undefined;
	/**
	 * Returns the default value for the registered data type.
	 */
	createZodDefaultValue?: CreateZodDefaultValueCallback | undefined;
};
