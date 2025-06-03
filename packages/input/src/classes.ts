import { classGroup } from "@tint-ui/tools/class-group";
import { createClassNameVariantFilter, useClasses } from "@tint-ui/theme";

const { base, b } = classGroup("input");
const classes = {
	input: base,
	md: b("md"),
	lg: b("lg"),
	sm: b("sm"),
	xs: b("xs"),
	inline: b("inline"),
	textarea: b("textarea"),
	group: b("group"),
	addon: b("addon"),
	addonText: b("addon-text"),
	addonButton: b("addon-button"),
	addonLabel: b("addon-label"),
	addonBlank: b("addon-blank"),
};

const useInputFilterClasses = createClassNameVariantFilter("input", classes, {
	base: "input",
	variants: {
		size: {
			md: "md",
			lg: "lg",
			sm: "sm",
			xs: "xs",
		},
	},
	flags: {},
	defaultVariants: {
		size: "md",
	},
});

const useInputClasses = () => useClasses("input", classes);

type InputClassesType = keyof typeof classes;

type InputClasses = Record<InputClassesType, string>;

export { classes, useInputFilterClasses, useInputClasses };
export type { InputClassesType, InputClasses };
