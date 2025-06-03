import { classGroup } from "@tint-ui/tools/class-group";
import { useClasses } from "@tint-ui/theme";

const { base, b } = classGroup("breadcrumb");
const classes = {
	breadcrumb: base,
	list: b("list"),
	item: b("title"),
	link: b("link"),
	page: b("page"),
	separator: b("separator"),
	ellipsis: b("ellipsis"),
	crOnly: b("crOnly"),
};

const useBreadcrumbClasses = () => useClasses("breadcrumb", classes);

type BreadcrumbClassesType = keyof typeof classes;

type BreadcrumbClasses = Record<BreadcrumbClassesType, string>;

export { classes, useBreadcrumbClasses };
export type { BreadcrumbClassesType, BreadcrumbClasses };
