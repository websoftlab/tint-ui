import { classGroup } from "@tint-ui/tools/class-group";
import { useClasses, createClassNameVariantFilter } from "@tint-ui/theme";

const { base, a, b } = classGroup("slide-navigator");
const classes = {
	slideNavigator: base,
	xs: a("xs"),
	sm: a("sm"),
	md: a("md"),
	lg: a("lg"),
	auto: a("auto"),
	navigation: a("navigation"),
	viewport: b("viewport"),
	container: b("container"),
	slide: b("slide"),
	button: b("button"),
};

const useSlideNavigatorFilterClasses = createClassNameVariantFilter("slide-navigator", classes, {
	base: "slideNavigator",
	variants: {
		size: {
			xs: "xs",
			sm: "sm",
			md: "md",
			lg: "lg",
			auto: "auto",
		},
	},
	flags: {
		navigation: "navigation",
	},
	defaultVariants: {
		size: "md",
		navigation: false,
	},
});

const useSlideNavigatorClasses = () => useClasses("slide-navigator", classes);

type SlideNavigatorClassesType = keyof typeof classes;

type SlideNavigatorClasses = Record<SlideNavigatorClassesType, string>;

export { classes, useSlideNavigatorClasses, useSlideNavigatorFilterClasses };
export type { SlideNavigatorClassesType, SlideNavigatorClasses };
