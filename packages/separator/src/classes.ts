import { classGroup } from "@tint-ui/tools/class-group";
import { useClasses } from "@tint-ui/theme";

const { base, a } = classGroup("separator");
const classes = {
	separator: base,
	horizontal: a("horizontal"),
	vertical: a("vertical"),
};

const useSeparatorClasses = () => useClasses("separator", classes);

type SeparatorClassesType = keyof typeof classes;

type SeparatorClasses = Record<SeparatorClassesType, string>;

export { classes, useSeparatorClasses };
export type { SeparatorClassesType, SeparatorClasses };
