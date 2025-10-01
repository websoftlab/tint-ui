import type { DataTableCellAdapter, DataTableCellAdapterOptions } from "../types";

const textAdapter: DataTableCellAdapter<{}> = (value) => {
	return String(value);
};

const textAdapterOptions: DataTableCellAdapterOptions<{}> = {
	nullable() {
		return "";
	},
};

export { textAdapter, textAdapterOptions };
