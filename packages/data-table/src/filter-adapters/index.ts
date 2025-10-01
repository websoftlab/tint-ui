import type { DataTableFilterAdapter } from "../types";

import { optionFilterAdapter } from "./option";

const adapters: Record<string, { adapter: DataTableFilterAdapter<any> }> = {
	option: { adapter: optionFilterAdapter },
};

export { adapters };
