# @tint-ui/form-grid

A flexible and responsive form grid component for React applications, built on top of `react-hook-form` and integrated with the Tint UI ecosystem.

## Installation

> We recommend installing the component using the `tint-ui add` command to add all necessary dependencies. However, you can also install the component manually:

```bash
npm install @tint-ui/form-grid
```

## Dependencies

This package requires the following peer dependencies:

- `react` (^16.8.0 || ^17 || ^18 || ^19)
- `react-hook-form` (^7)
- `zod` (^3)
- `@hookform/resolvers` (^5)

## Usage

### Using the trigger for form submission

FormGrid requires a trigger to submit form data. By default, it uses a trigger named `"fetch.form"` which must implement the `FormGridTriggerProps` interface:

```tsx
// file use-fetch-form-register.ts
import type { FormGridTriggerProps } from "@tint-ui/form-grid";

import * as React from "react";
import axios from "axios";
import { useTrigger } from "@tint-ui/trigger";

export const useFetchFormRegister = () => {
	const trigger = useTrigger();
	React.useEffect(
		() =>
			trigger.register("fetch.form", async (props: FormGridTriggerProps) => {
				const { url, method = "post", body, onError, onSuccess } = props;
				try {
					const { data, status, statusText } = await axios.request({
						url,
						method,
						data: JSON.stringify(body),
						headers: {
							"content-type": "application/json",
						},
						validateStatus() {
							return true;
						},
					});
					if ((status / 10) >> 0 === 20) {
						onSuccess();
					} else {
						onError(data != null ? data : { message: `${status} ${statusText}` });
					}
				} catch (err) {
					onError(err);
				}
			}),
		[trigger]
	);
};
```

### Using FormGridType

To use the form, you need to implement and pass the FormGridType interface to useFormGrid:

```tsx
// file my-form.ts
import type { FormGridType } from "@tint-ui/form-grid";

import * as React from "react";
import { FormGrid, useFormGrid, FormGridContext } from "@tint-ui/form-grid";
import { Button } from "@tint-ui/button";
import { useFetchFormRegister } from "./use-fetch-form-register";

const formGrid: FormGridType = {
	name: "form-name",
	url: "/api/request.json",
	fields: [
		{ name: "name", label: "Your name" },
		{ type: "email", name: "email", label: "Email", required: true },
		{ type: "password", name: "password", label: "Password" },
	],
};

export const MyForm = () => {
	const ctx = useFormGrid(formGrid);
	useFetchFormRegister();
	return (
		<FormGridContext.Provider value={ctx}>
			<FormGrid>
				<Button type="submit" disabled={ctx.disabled} loading={ctx.loading}>
					Send
				</Button>
			</FormGrid>
		</FormGridContext.Provider>
	);
};
```

## Features

- Responsive grid layout for form fields
- Integration with `react-hook-form` for form state management
- Support for form validation using Zod schemas
- Automatic field type detection and rendering
- Support for confirmation fields
- Loading state handling
- Customizable styling through theme system
- Support for all Tint UI input components

## Components & Hooks

### FormGrid

The main component that renders the form grid layout. Must be used inside `FormGridContext.Provider`.

### FormGridContext

React context created using the useFormGrid hook. Contains form state, validation, loading state, and submission handlers.

### useFormGrid

Hook for creating form grid context. Takes a `FormGridType` configuration and returns a `FormGridContextType` object. As a second argument accepts `UseFormOptions` that define trigger name, form default values and toastError flag.

## Base Types

### FormGridType

- `name` - The name of the form for identification.
- `url` - The URL to send the form data.
- `method` - The method to use to send the form data, default is "post".
- `fields` - The fields of the form.
- `confirmation` - The confirmation message to display checkbox for data processing consent. Adds a checkbox to the form if not false.
- `message` - The message to display after the form is submitted (implementation is up to the user, context contains a string but how to display the message is decided by the user).

### FormGridFieldType

- `name` - The name of the field.
- `label` - The label of the field.
- `type` - The type of the field. Can be a built-in type or a custom type registered via adapter. Built-in types: "text", "textarea", "select", "checkbox", "number", "password", "email".
- `placeholder` - The placeholder of the field.
- `required` - The required flag of the field.
- `config` - The config of the field.
- `col` - The column span of the field. The default is "col-1". If the field has full flag set in config, it will always take 100% width of the form block regardless of this setting.
- `colEnd` - The column end flag of the field. If true, forces a line break after this field, even if there is space available for subsequent fields.
- `colStart` - The column start flag of the field. If true, forces the field to start on a new line, even if there is available space after previous fields.

#### Configurations for types

The type of the `config` is determined by the type of the field.

- `TextAdapterConfig` - Config for the `"text"`, `"textarea"`, `"email"` types. Allows configuring text formatting and change handlers.
- `PasswordAdapterConfig` - Config for the `"password"` type. Extends `TextAdapterConfig` and adds reveal mode configuration.
- `NumberAdapterConfig` - Config for the `"number"` type. Allows setting min/max values, step size, and value formatting/change handlers.
- `SelectAdapterConfig` - Config for the `"select"` type. Configures options list, search behavior, value type and localization.
- `CheckboxAdapterConfig` - Config for the `"checkbox"` type. Empty config object as checkbox fields don't require additional configuration.

### FormGridContextType

- `form` - The form grid type.
- `ctx` - The form context. It is a hook from react-hook-form.
- `confirmation` - The confirmation flag. If true, the confirmation will be displayed.
- `confirmMessage` - The confirmation message.
- `error` - The error message. Only used when toastError is false. Error message display implementation is handled by the user.
- `message` - The message to display after the form is submitted. Implementation is handled by the user.
- `complete` - The complete flag. If true, the form is submitted and there are no errors.
- `disabled` - The disabled flag. If true, the form is disabled.
- `loading` - The loading flag. If true, the form is loading.
- `onReset` - The onReset function. After successful form submission, another submission is only possible after calling this function. The complete flag is reset when this function is called.
- `onSubmit` - The onSubmit function. It is a form event handler that is automatically attached to the form inside FormGrid, but can be used manually if FormGrid is not used and implemented differently.

## Tools

- `addFormFieldAdapter` - Function to add a form field adapter. Used to add a form field adapter to the form grid.
- `addFormFieldAdapterAsync` - Function to add an asynchronous form field adapter. Used to add an asynchronous form field adapter to the form grid.
- `hasFormFieldAdapter` - Function to check if a form field adapter exists. Used to check if a form field adapter exists in the form grid.

## License

MIT
