import type { DataTableCellAdapter, DataTableCellAdapterOptions } from "../types";

import { textAdapter, textAdapterOptions } from "./text";
import { numberAdapter, numberAdapterOptions } from "./number";
import { booleanAdapter, booleanAdapterOptions } from "./boolean";

const adapters: Record<string, { adapter: DataTableCellAdapter<any>; options: DataTableCellAdapterOptions<any> }> = {
	text: { adapter: textAdapter, options: textAdapterOptions },
	number: { adapter: numberAdapter, options: numberAdapterOptions },
	boolean: { adapter: booleanAdapter, options: booleanAdapterOptions },
};

export { adapters };
