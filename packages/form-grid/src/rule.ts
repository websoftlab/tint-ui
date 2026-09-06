import type { FormGridThenRuleEnum, FormGridThenRuleGroup, FormGridThenRule, FormGridThenRuleScalar } from "./types";

import { isEmpty } from "@tint-ui/tools/is-empty";

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

type ThenType = FormGridThenRuleScalar | FormGridThenRuleEnum | FormGridThenRuleGroup;

const testRuleInGroup = (
	mode: "or" | "and" | "xor",
	ruleArray: ThenType[],
	data: Record<string, unknown>,
	link: Set<FormGridThenRuleGroup>
) => {
	let success = 0;

	const isXor = mode === "xor";
	const isOr = mode === "or";
	const isAnd = mode === "and";

	for (const once of ruleArray) {
		if (testRule(once, data, link)) {
			if (isOr) {
				return true;
			}
			success++;
			if (isXor && success > 1) {
				return false;
			}
		} else if (isAnd) {
			return false;
		}
	}

	return isOr ? false : isXor ? success === 1 : true;
};

const testRuleGroup = (
	rule: FormGridThenRuleGroup,
	data: Record<string, unknown>,
	link: Set<FormGridThenRuleGroup>
) => {
	const { mode, rule: ruleArray } = rule;
	if (!Array.isArray(ruleArray) || link.has(rule)) {
		return false;
	}

	let count = ruleArray.length;

	if (count === 0 || (mode === "xor" && count === 1)) {
		return false;
	}

	link.add(rule);
	const test = testRuleInGroup(mode, ruleArray, data, link);
	link.delete(rule);

	return test;
};

const testRuleEnum = (rule: FormGridThenRuleEnum, value: unknown) => {
	if (!Array.isArray(rule.value)) {
		return false;
	}
	const test = rule.value.includes(value);
	return rule.operator === "in" ? test : !test;
};

const testRuleScalar = (rule: FormGridThenRuleScalar, value: unknown) => {
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

const testRule = (rule: ThenType, data: Record<string, unknown>, link: Set<FormGridThenRuleGroup>): boolean => {
	if ("mode" in rule) {
		return testRuleGroup(rule, data, link);
	}

	switch (rule.operator) {
		case "in":
		case "not-in":
			return testRuleEnum(rule, data[rule.name]);
	}

	return testRuleScalar(rule, data[rule.name]);
};

const ruleName = (rule: ThenType, names: Set<string>) => {
	if ("mode" in rule) {
		if (Array.isArray(rule.rule)) {
			for (const once of rule.rule) {
				ruleName(once, names);
			}
		}
	} else {
		const { name } = rule;
		if (name) {
			names.add(name);
		}
	}
};

const getRuleNames = (rule: FormGridThenRule) => {
	const names = new Set<string>();
	ruleName(rule, names);
	return Array.from(names.values());
};

const hasRule = (rule: FormGridThenRule, data: object) => {
	if (data == null) {
		return false;
	}
	return testRule(rule, data as Record<string, unknown>, new Set());
};

export { hasRule, getRuleNames };
