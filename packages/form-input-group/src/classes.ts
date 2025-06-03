import { classGroup } from "@tint-ui/tools/class-group";
import { useClasses } from "@tint-ui/theme";

const { base, a, b } = classGroup("form-input-group");
const classes = {
	group: base,
	required: a("required"),
	invalid: a("invalid"),
	label: b("label"),
	empty: b("label"),
	name: b("name"),
	asterisk: b("asterisk"),
	helper: b("helper"),
};

const useFormInputGroupClasses = () => useClasses("form-input-group", classes);

type FormInputGroupClassesType = keyof typeof classes;

type FormInputGroupClasses = Record<FormInputGroupClassesType, string>;

export { classes, useFormInputGroupClasses };
export type { FormInputGroupClassesType, FormInputGroupClasses };
