import { classGroup } from "@tint-ui/tools/class-group";
import { useClasses } from "@tint-ui/theme";

const { base, b } = classGroup("data-table-filter");
const filterClasses = {
	button: base,
	popover: b("popover"),
	badges: b("badges"),
	badge: b("badge"),
	mobile: b("mobile"),
	desktop: b("desktop"),
	checkbox: b("checkbox"),
	icon: b("icon"),
	label: b("label"),
	selected: b("selected"),
	text: b("text"),
	textMobile: b("text", "mobile"),
};

const useDataTableFilterClasses = () => useClasses("data-table-filter", filterClasses);

type DataTableFilterClassesType = keyof typeof filterClasses;

type DataTableFilterClasses = Record<DataTableFilterClassesType, string>;

export { filterClasses, useDataTableFilterClasses };
export type { DataTableFilterClassesType, DataTableFilterClasses };
