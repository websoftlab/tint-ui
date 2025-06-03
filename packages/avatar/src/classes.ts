import { classGroup } from "@tint-ui/tools/class-group";
import { useClasses, createClassNameVariantFilter } from "@tint-ui/theme";

const { base, a, b } = classGroup("avatar");
const classes = {
	avatar: base,
	xs: a("xs"),
	sm: a("sm"),
	md: a("md"),
	lg: a("lg"),
	xl: a("xl"),
	wrap: b("wrap"),
	badge: b("badge"),
	destructive: b("badge-destructive"),
	image: b("image"),
	fallback: b("fallback"),
	icon: b("icon"),
};

const useAvatarFilterClasses = createClassNameVariantFilter("avatar", classes, {
	base: "avatar",
	variants: {
		size: {
			xs: "xs",
			sm: "sm",
			md: "md",
			lg: "lg",
			xl: "xl",
		},
	},
	flags: {},
	defaultVariants: {
		size: "md",
	},
});

const useAvatarClasses = () => useClasses("avatar", classes);

type AvatarClassesType = keyof typeof classes;

type AvatarClasses = Record<AvatarClassesType, string>;

export { classes, useAvatarClasses, useAvatarFilterClasses };
export type { AvatarClassesType, AvatarClasses };
