import { classGroup } from "@tint-ui/tools/class-group";
import { useClasses } from "@tint-ui/theme";

const { base, b } = classGroup("form-grid");
const classes = {
	formGrid: base,
	form: b("form"),
	group: b("group"),
	n1: b("group", "n1"),
	n1x2: b("group", "n1x2"),
	n1x3: b("group", "n1x3"),
	n2x3: b("group", "n2x3"),
	loader: b("loader"),
	error: b("error"),
};

const useFormGridClasses = () => useClasses("form-grid", classes);

type FormGridClassesType = keyof typeof classes;

type FormGridClasses = Record<FormGridClassesType, string>;

export { classes, useFormGridClasses };
export type { FormGridClassesType, FormGridClasses };
