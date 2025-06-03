import { classGroup } from "@tint-ui/tools/class-group";
import { useClasses } from "@tint-ui/theme";

const { base } = classGroup("popover");
const classes = {
	popover: base,
};

const usePopoverClasses = () => useClasses("popover", classes);

type PopoverClassesType = keyof typeof classes;

type PopoverClasses = Record<PopoverClassesType, string>;

export { classes, usePopoverClasses };
export type { PopoverClassesType, PopoverClasses };
