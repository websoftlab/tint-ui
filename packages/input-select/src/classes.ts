import { classGroup } from "@tint-ui/tools/class-group";
import { useClasses } from "@tint-ui/theme";

const { base, a, b } = classGroup("input-select");
const classes = {
	select: base,
	popover: b("popover"),
	tags: b("tags"),
	tag: b("tag"),
	placeholder: b("placeholder"),
	close: b("close"),
	check: b("icon", "check"),
	loader: b("icon", "loader"),
	selector: b("icon", "selector"),
	error: b("error"),
	hidden: b("hidden"),
	xs: a("size-xs"),
	sm: a("size-sm"),
	md: a("size-md"),
	lg: a("size-lg"),
};

const useInputSelectClasses = () => useClasses("input-select", classes);

type InputSelectClassesType = keyof typeof classes;

type InputSelectClasses = Record<InputSelectClassesType, string>;

export { classes, useInputSelectClasses };
export type { InputSelectClassesType, InputSelectClasses };
