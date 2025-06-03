import { classGroup } from "@tint-ui/tools/class-group";
import { useClasses } from "@tint-ui/theme";

const { base, b } = classGroup("toast");
const classes = {
	toaster: base,

	svgIcon: b("svg-icon"),
	svgIconSpin: b("svg-spin"),
	svgIconClose: b("svg-close"),

	// sonner classes
	toast: b("toast"),
	title: b("title"),
	description: b("description"),
	loader: b("loader"),
	closeButton: b("closeButton"),
	cancelButton: b("cancelButton"),
	actionButton: b("actionButton"),
	success: b("success"),
	error: b("error"),
	info: b("info"),
	warning: b("warning"),
	loading: b("loading"),
	default: b("default"),
	content: b("content"),
	icon: b("icon"),
};

const useToastClasses = () => useClasses("toast-manager", classes);

type ToastClassesType = keyof typeof classes;

type ToastClasses = Record<ToastClassesType, string>;

export { classes, useToastClasses };
export type { ToastClassesType, ToastClasses };
