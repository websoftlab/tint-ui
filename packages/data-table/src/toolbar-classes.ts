import { classGroup } from "@tint-ui/tools/class-group";
import { useClasses } from "@tint-ui/theme";

const { base, b, a } = classGroup("data-table-toolbar");
const toolbarClasses = {
	toolbar: base,
	withFilter: a("with-filter"),
	withFilterGroup: a("with-filter-group"),
	search: b("search"),
	filters: b("filters"),
	reset: b("reset"),
	options: b("options"),
	mobile: b("mobile"),
	heading: b("heading"),
};

const useDataTableToolbarClasses = () => useClasses("data-table-toolbar", toolbarClasses);

type DataTableToolbarClassesType = keyof typeof toolbarClasses;

type DataTableToolbarClasses = Record<DataTableToolbarClassesType, string>;

export { toolbarClasses, useDataTableToolbarClasses };
export type { DataTableToolbarClassesType, DataTableToolbarClasses };
