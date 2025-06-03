import { classGroup } from "@tint-ui/tools/class-group";
import { useClasses } from "@tint-ui/theme";

const c = classGroup("input-checkbox");
const g = classGroup("input-checkbox-group");

const classes = {
	checkbox: c.base,
	group: g.base,
	vertical: g.a("vertical"),
	horizontal: g.a("horizontal"),
	label: g.a("label"),
	labelText: g.a("label-text"),
	sm: c.a("size-sm"),
	md: c.a("size-md"),
	lg: c.a("size-lg"),
};

const useInputCheckboxClasses = () => useClasses("input-checkbox", classes);

type CheckboxClassesType = keyof typeof classes;

type CheckboxClasses = Record<CheckboxClassesType, string>;

export { classes, useInputCheckboxClasses };
export type { CheckboxClassesType, CheckboxClasses };
