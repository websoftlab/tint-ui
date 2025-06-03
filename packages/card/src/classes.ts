import { classGroup } from "@tint-ui/tools/class-group";
import { useClasses } from "@tint-ui/theme";

const cg = classGroup("card");
const classes = {
	card: cg.base,
	header: cg.a("header"),
	title: cg.a("title"),
	description: cg.a("description"),
	content: cg.a("content"),
	footer: cg.a("footer"),
};

const useCardClasses = () => useClasses("card", classes);

type CardClassesType = keyof typeof classes;

type CardClasses = Record<CardClassesType, string>;

export { classes, useCardClasses };
export type { CardClassesType, CardClasses };
