import { classGroup } from "@tint-ui/tools/class-group";
import { useClasses } from "@tint-ui/theme";

const { base, b } = classGroup("dropdown-menu");
const classes = {
	menu: base,
	subTrigger: b("sub-trigger"),
	subContent: b("sub-content"),
	content: b("content"),
	item: b("item"),
	label: b("label"),
	separator: b("separator"),
	inset: b("inset"),
	checkboxItem: b("checkbox-item"),
	radioItem: b("radio-item"),
	checker: b("checker"),
	shortcut: b("shortcut"),
	iconRight: b("icon-right"),
	iconCheck: b("icon-check"),
	iconCircle: b("icon-circle"),
};

const useDropdownMenuClasses = () => useClasses("dropdown-menu", classes);

type DropdownMenuClassesType = keyof typeof classes;

type DropdownMenuClasses = Record<DropdownMenuClassesType, string>;

export { classes, useDropdownMenuClasses };
export type { DropdownMenuClassesType, DropdownMenuClasses };
