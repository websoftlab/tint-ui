import { classGroup } from "@tint-ui/tools/class-group";
import { useClasses } from "@tint-ui/theme";

const c = classGroup("input-select");
const classes = {
	select: c.base,
	popover: c.a("popover"),
	tags: c.a("tags"),
	tag: c.a("tag"),
	placeholder: c.a("placeholder"),
	check: c.a("icon-check"),
	clear: c.a("icon-clear"),
	loader: c.a("icon-loader"),
	selector: c.a("icon-selector"),
	xs: c.a("size-xs"),
	sm: c.a("size-sm"),
	md: c.a("size-md"),
	lg: c.a("size-lg"),
};

const useInputSelectClasses = () => useClasses("input-select", classes);

type InputSelectClassesType = keyof typeof classes;

type InputSelectClasses = Record<InputSelectClassesType, string>;

export { classes, useInputSelectClasses };
export type { InputSelectClassesType, InputSelectClasses };
