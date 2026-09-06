import type { FormGridFieldOneOfDisplayType, FormGridThenRule } from "./types";

import * as React from "react";
import { useFormContext } from "react-hook-form";
import { useFormPrefix } from "@tint-ui/form-input-group";
import { isArrayType, isHiddenType, isObjectType } from "./type-of";
import { createDefaultValues } from "./create-default-values";
import { createZodDefaultValue } from "./form-grid-field-item";
import { useWatchRule } from "./use-watch-rule";

type FormGridRuleProps = {
	field: FormGridFieldOneOfDisplayType;
	rule: FormGridThenRule;
	children: React.ReactNode;
};

const FormGridRule: React.FC<FormGridRuleProps> = ({ field, rule, children }: FormGridRuleProps) => {
	const ctx = useFormContext();
	const pref = useFormPrefix();
	const requiredFieldClone = React.useRef(
		new WeakMap<FormGridFieldOneOfDisplayType, FormGridFieldOneOfDisplayType>()
	);

	const test = useWatchRule(rule, {
		initial: true,
		onChange(test) {
			const name = pref.getName(field.name);
			if (!test) {
				ctx.setValue(name, null);
			} else {
				const value = ctx.getValues(name);
				// set default value
				if (isArrayType(field)) {
					// already filled
					if (Array.isArray(value) && value.length > 0) {
						return;
					}
					const { min } = field;
					if (min != null && min > 0) {
						ctx.setValue(name, [createDefaultValues(field.fields)]);
					} else if (!Array.isArray(value)) {
						ctx.setValue(name, []);
					}
				} else if (isObjectType(field)) {
					// already filled
					if (value != null && typeof value === "object") {
						return;
					}
					ctx.setValue(name, createDefaultValues(field.fields));
				} else if (value == null) {
					const defaultValue = isHiddenType(field) ? field.defaultValue : createZodDefaultValue(field);
					if (defaultValue != null) {
						ctx.setValue(name, defaultValue);
					}
				}
			}
		},
	});

	if (!test) {
		return null;
	}

	if (React.isValidElement<{ field?: FormGridFieldOneOfDisplayType }>(children)) {
		if (rule.required && children.props.field === field) {
			let clone = requiredFieldClone.current.get(field);
			if (!clone) {
				clone = { ...field, required: true };
				requiredFieldClone.current.set(field, clone);
			}
			return React.cloneElement(children, { field: clone });
		}
		return children;
	}

	return <>{children}</>;
};

FormGridRule.displayName = "FormGridRule";

export { FormGridRule };
export type { FormGridRuleProps };
