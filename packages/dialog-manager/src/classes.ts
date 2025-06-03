import { classGroup } from "@tint-ui/tools/class-group";
import { useClasses } from "@tint-ui/theme";

const { base, b } = classGroup("dialog-manager");
const classes = {
	dialogManager: base,
	overlay: b("overlay"),
	content: b("content"),
	sm: b("size", "sm"),
	md: b("size", "md"),
	lg: b("size", "lg"),
	xl: b("size", "xl"),
	xxl: b("size", "xxl"),
};

const useDialogManagerClasses = () => useClasses("dialog-manager", classes);

type DialogManagerClassesType = keyof typeof classes;

type DialogManagerClasses = Record<DialogManagerClassesType, string>;

export { classes, useDialogManagerClasses };
export type { DialogManagerClassesType, DialogManagerClasses };
