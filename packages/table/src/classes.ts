import { classGroup } from "@tint-ui/tools/class-group";
import { useClasses } from "@tint-ui/theme";

const { base, b } = classGroup("table");
const classes = {
	table: base,
	wrapper: b("wrapper"),
	compact: b("compact"),
	header: b("header"),
	body: b("body"),
	footer: b("footer"),
	row: b("row"),
	head: b("head"),
	cell: b("cell"),
	caption: b("caption"),
	sort: b("sort"),
};

const useTableClasses = () => useClasses("table", classes);

type TableClassesType = keyof typeof classes;

type TableClasses = Record<TableClassesType, string>;

export { classes, useTableClasses };
export type { TableClassesType, TableClasses };
