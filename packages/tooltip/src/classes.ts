import { classGroup } from "@tint-ui/tools/class-group";
import { useClasses } from "@tint-ui/theme";

const { base } = classGroup("tooltip");
const classes = {
	tooltip: base,
};

const useTooltipClasses = () => useClasses("tooltip", classes);

type TooltipClassesType = keyof typeof classes;

type TooltipClasses = Record<TooltipClassesType, string>;

export { classes, useTooltipClasses };
export type { TooltipClassesType, TooltipClasses };
