import { classGroup } from "@tint-ui/tools/class-group";
import { useClasses, createClassNameVariantFilter } from "@tint-ui/theme";

const { base, a, b } = classGroup("alert");
const classes = {
	alert: base,
	default: a("default"),
	primary: a("primary"),
	secondary: a("secondary"),
	destructive: a("destructive"),
	title: b("title"),
	description: b("description"),
};

const useAlertFilterClasses = createClassNameVariantFilter("alert", classes, {
	base: "alert",
	variants: {
		variant: {
			default: "default",
			primary: "primary",
			secondary: "secondary",
			destructive: "destructive",
		},
	},
	flags: {},
	defaultVariants: {
		variant: "default",
	},
});

const useAlertClasses = () => useClasses("alert", classes);

type AlertClassesType = keyof typeof classes;

type AlertClasses = Record<AlertClassesType, string>;

export { classes, useAlertClasses, useAlertFilterClasses };
export type { AlertClassesType, AlertClasses };
