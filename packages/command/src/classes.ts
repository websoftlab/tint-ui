import { classGroup } from "@tint-ui/tools/class-group";
import { useClasses } from "@tint-ui/theme";

const { base, a } = classGroup("command");
const classes = {
	command: base,
	empty: a("empty"),
	group: a("group"),
	search: a("search"),
	icon: a("icon"),
	input: a("input"),
	list: a("list"),
	item: a("item"),
	separator: a("separator"),
	shortcut: a("shortcut"),
};

const useCommandClasses = () => useClasses("command", classes);

type CommandClassesType = keyof typeof classes;

type CommandClasses = Record<CommandClassesType, string>;

export { classes, useCommandClasses };
export type { CommandClassesType, CommandClasses };
