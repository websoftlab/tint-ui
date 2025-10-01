import type { FormGridFieldOneOfDisplayType, FormGridThenRule } from "./types";

import * as React from "react";
import { useFormContext } from "react-hook-form";
import { isEmpty } from "@tint-ui/tools/is-empty";
import { isArrayType, isHiddenType, isObjectType } from "./type-of";
import { createDefaultValues } from "./create-default-values";
import { createZodDefaultValue } from "./form-grid-field-item";
import { useWatch } from "./use-watch";
import { useFormPrefix } from "@tint-ui/form-input-group";

const getNumber = (value: unknown): number => {
	const tof = typeof value;
	if (tof === "number") {
		return value as number;
	}
	if (tof === "string") {
		return parseFloat(value as string);
	}
	return NaN;
};

const hasRule = (rule: FormGridThenRule, value: unknown): boolean => {
	if (rule.operator === "in" || rule.operator === "not-in") {
		const test = Array.isArray(rule.value) ? rule.value.includes(value) : false;
		return rule.operator === "in" ? test : !test;
	}

	switch (rule.operator) {
		case "is-null":
			return value == null;
		case "not-null":
			return value != null;
		case "is-empty":
			return isEmpty(value);
		case "not-empty":
			return !isEmpty(value);
	}

	const ruleValue = rule.value == null ? true : rule.value;
	const { operator = "eq" } = rule;
	switch (operator) {
		case "eq":
			return value === ruleValue;
		case "not":
			return value !== ruleValue;
		case "lt":
			return getNumber(value) < (ruleValue as number);
		case "lte":
			return getNumber(value) <= (ruleValue as number);
		case "gt":
			return getNumber(value) > (ruleValue as number);
		case "gte":
			return getNumber(value) >= (ruleValue as number);
		case "include":
		case "not-include":
			if (!Array.isArray(value)) {
				return false;
			}
			const test = value.includes(ruleValue);
			return rule.operator === "include" ? test : !test;
	}

	return false;
};

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
	const test = useWatch(rule.name, rule, (value, rule) => hasRule(rule, value), {
		initial: true,
		onChangeValue(test) {
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
					ctx.setValue(name, [createDefaultValues(field.fields)]);
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
