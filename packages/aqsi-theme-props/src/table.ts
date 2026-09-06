import type { ThemePropsType } from "@tint-ui/theme";

import { DATA_ATTRIBUTES, dataIdProps } from "./constant";

const notRequired = { required: false };
const componentTablePropsType: ThemePropsType<{ id?: string }> = (props, name) => {
	switch (name) {
		case "component.table":
			return dataIdProps(props, DATA_ATTRIBUTES.TABLE, "table", notRequired);
		case "component.table.header":
			return dataIdProps(props, DATA_ATTRIBUTES.TABLE_HEADER, "table-header", notRequired);
		case "component.table.body":
			return dataIdProps(props, DATA_ATTRIBUTES.TABLE_BODY, "table-body", notRequired);
		case "component.table.footer":
			return dataIdProps(props, DATA_ATTRIBUTES.TABLE_FOOTER, "table-footer", notRequired);
		case "component.table.row":
			return dataIdProps(props, DATA_ATTRIBUTES.TABLE_ROW, "table-row", notRequired);
		case "component.table.head":
			return dataIdProps(props, DATA_ATTRIBUTES.TABLE_HEADER_CELL, "table-header-cell", notRequired);
		case "component.table.cell":
			return dataIdProps(props, DATA_ATTRIBUTES.TABLE_CELL, "table-cell", notRequired);
	}
	return props;
};

const componentTableProps = {
	"component.table": componentTablePropsType,
	"component.table.header": componentTablePropsType,
	"component.table.body": componentTablePropsType,
	"component.table.footer": componentTablePropsType,
	"component.table.row": componentTablePropsType,
	"component.table.head": componentTablePropsType,
	"component.table.cell": componentTablePropsType,
};

export { componentTableProps, componentTablePropsType };
