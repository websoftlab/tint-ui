import { classGroup } from "@tint-ui/tools/class-group";
import { useClasses, createClassNameVariantFilter } from "@tint-ui/theme";

const { base, a, b } = classGroup("button");
const classes = {
	button: base,
	loader: a("loader"),
	icon: a("icon"),
	disabled: b("disabled"),
	md: b("md"),
	lg: b("lg"),
	sm: b("sm"),
	xs: b("xs"),
	iconOnly: b("icon-only"),
	primary: b("primary"),
	secondary: b("secondary"),
	black: b("black"),
	destructive: b("destructive"),
	destructiveOutline: b("destructive-outline"),
	outline: b("outline"),
	ghost: b("ghost"),
	link: b("link"),
	spin: b("spin"),
	full: b("full"),
	rounded: b("rounded"),
};

const useButtonFilterClasses = createClassNameVariantFilter("button", classes, {
	base: "button",
	variants: {
		size: {
			md: "md",
			lg: "lg",
			sm: "sm",
			xs: "xs",
		},
		variant: {
			primary: "primary",
			secondary: "secondary",
			black: "black",
			destructive: "destructive",
			"destructive-outline": "destructiveOutline",
			outline: "outline",
			ghost: "ghost",
			link: "link",
		},
		// todo fill: { solid: "", outline: "", ghost: "", link: "" }
	},
	flags: {
		iconOnly: "iconOnly",
		full: "full",
		rounded: "rounded",
		disabled: "disabled",
	},
	defaultVariants: {
		size: "md",
		variant: "primary",
	},
});

const useButtonClasses = () => useClasses("button", classes);

type ButtonClassesType = keyof typeof classes;

type ButtonClasses = Record<ButtonClassesType, string>;

export { classes, useButtonClasses, useButtonFilterClasses };
export type { ButtonClassesType, ButtonClasses };
