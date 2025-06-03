import { classGroup } from "@tint-ui/tools/class-group";
import { useClasses } from "@tint-ui/theme";

const { base, a } = classGroup("dialog");
const classes = {
	dialog: base,
	overlay: a("overlay"),
	title: a("title"),
	header: a("header"),
	footer: a("footer"),
	description: a("description"),
	close: a("close"),
};

const useDialogClasses = () => useClasses("dialog", classes);

type DialogClassesType = keyof typeof classes;

type DialogClasses = Record<DialogClassesType, string>;

export { classes, useDialogClasses };
export type { DialogClassesType, DialogClasses };
