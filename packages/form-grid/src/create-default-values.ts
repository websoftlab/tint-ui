import type { FormGridFieldOneOfType } from "./types";

import { isArrayType, isHiddenType, isObjectType } from "./type-of";
import { createZodDefaultValue } from "./form-grid-field-item";

const createDefaultValues = (
	fields: FormGridFieldOneOfType[],
	initialValues: Record<string, unknown> = {},
	confirmation: boolean = false
) => {
	const values: Record<string, unknown> = { ...initialValues };
	for (const field of fields) {
		const { name } = field;

		// array type
		if (isArrayType(field)) {
			const value = values[name];
			if (Array.isArray(value)) {
				values[name] = value;
			}
			continue;
		}

		// object type
		if (isObjectType(field)) {
			const value = values[name];
			if (field.required || value != null) {
				values[name] = createDefaultValues(
					field.fields,
					value != null && typeof value === "object" ? (value as Record<string, unknown>) : undefined
				);
			}
			continue;
		}

		if (values[name] != null) {
			continue;
		}
		const defaultValue = isHiddenType(field) ? field.defaultValue : createZodDefaultValue(field);
		if (defaultValue != null) {
			values[name] = defaultValue;
		}
	}

	if (confirmation) {
		values.__form_confirmation = false;
	}

	return values;
};

export { createDefaultValues };
