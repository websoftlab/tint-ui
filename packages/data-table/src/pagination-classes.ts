import { classGroup } from "@tint-ui/tools/class-group";
import { useClasses } from "@tint-ui/theme";

const { base, b } = classGroup("data-table-pagination");
const paginationClasses = {
	pagination: base,
	divider: b("divider"),
	group: b("group"),
	separator: b("separator"),
	firstLast: b("first-last"),
	previousNext: b("previous-next"),
};

const useDataTablePaginationClasses = () => useClasses("data-table-pagination", paginationClasses);

type DataTablePaginationClassesType = keyof typeof paginationClasses;

type DataTablePaginationClasses = Record<DataTablePaginationClassesType, string>;

export { paginationClasses, useDataTablePaginationClasses };
export type { DataTablePaginationClassesType, DataTablePaginationClasses };
