import { classGroup } from "@tint-ui/tools/class-group";
import { useClasses } from "@tint-ui/theme";

const { base, b } = classGroup("data-table");
const classes = {
	dataTable: base,
	table: b("table"),

	cellNotFound: b("cell", "not-found"),
	loader: b("loader"),
	error: b("error"),
	booleanCellType: b("cell-type", "boolean"),
	numberCellType: b("cell-type", "number"),
	iconTrue: b("icon", "true"),
	iconFalse: b("icon", "false"),
	iconNull: b("icon", "null"),
	isNaN: b("isNaN"),

	menuGroup: b("menu-group"),
	menuItemDestructive: b("menu-item-destructive"),
};

const useDataTableClasses = () => useClasses("data-table", classes);

type DataTableClassesType = keyof typeof classes;

type DataTableClasses = Record<DataTableClassesType, string>;

export { classes, useDataTableClasses };
export type { DataTableClassesType, DataTableClasses };
