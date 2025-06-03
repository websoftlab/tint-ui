import { classGroup } from "@tint-ui/tools/class-group";
import { useClasses, createClassNameVariantFilter } from "@tint-ui/theme";

const { base, a } = classGroup("badge");
const classes = {
	badge: base,
	interactive: a("interactive"),
	primary: a("primary"),
	secondary: a("secondary"),
	destructive: a("destructive"),
	outline: a("outline"),
};

const useBadgeFilterClasses = createClassNameVariantFilter("badge", classes, {
	base: "badge",
	variants: {
		variant: {
			primary: "primary",
			secondary: "secondary",
			destructive: "destructive",
			outline: "outline",
		},
	},
	flags: {
		interactive: "interactive",
	},
	defaultVariants: {
		variant: "primary",
	},
});

const useBadgeClasses = () => useClasses("badge", classes);

type BadgeClassesType = keyof typeof classes;

type BadgeClasses = Record<BadgeClassesType, string>;

export { classes, useBadgeClasses, useBadgeFilterClasses };
export type { BadgeClassesType, BadgeClasses };
