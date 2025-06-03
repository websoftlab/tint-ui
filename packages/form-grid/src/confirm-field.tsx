"use client";

import * as React from "react";
import { useProps } from "@tint-ui/theme";
import { FormInputGroup } from "@tint-ui/form-input-group";
import { inputCheckboxLabelAdapter } from "@tint-ui/input-checkbox";

const ConfirmField = (inputProps: {
	placeholder?: string | null;
	themePropsType?: string;
	message: React.ReactNode;
}) => {
	const { message, placeholder, ...props } = useProps(
		"component.form-grid.confirm-field",
		{ name: "__form_confirmation", required: true, label: false as false | string, ...inputProps },
		{ as: "div" }
	);
	return (
		<FormInputGroup {...props}>
			{inputCheckboxLabelAdapter({
				label: message,
				placeholder: placeholder || undefined,
			})}
		</FormInputGroup>
	);
};

ConfirmField.displayName = "ConfirmField";

export { ConfirmField };
