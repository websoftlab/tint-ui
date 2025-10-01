import type { DataTableContextType } from "./types";

import * as React from "react";
import { invariant } from "@tint-ui/tools/proof";

const DataTableContext = React.createContext<null | DataTableContextType<any>>(null);

const useDataTableContext = function <TData>(): DataTableContextType<TData> {
	const ctx = React.useContext(DataTableContext);
	invariant(ctx, "DataTableContextType is not defined");
	return ctx;
};

export { DataTableContext, useDataTableContext };
