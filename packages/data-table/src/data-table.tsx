"use client";

import type { DataTableCoreProps } from "./types";

import * as React from "react";
import { useDataTable } from "./use-data-table";
import { DataTableContext } from "./context";
import { DataTableToolbar } from "./data-table-toolbar";
import { DataTableContent } from "./data-table-content";
import { DataTablePagination } from "./data-table-pagination";

type DataTablePropsNoRef<TData extends object> = Omit<
	React.HTMLAttributes<HTMLTableElement>,
	keyof DataTableCoreProps<TData>
> & {
	wrapperProps?: React.HTMLAttributes<HTMLDivElement>;
	themePropsType?: string;
} & DataTableCoreProps<TData>;

const DataTable = React.forwardRef(
	<TData extends object>(
		{
			themePropsType = "data-table",
			header = "top",
			table: tableProp,
			data,
			navbar,
			initialData,
			limit,
			offset,
			lexicon,
			total,
			onRowClick,
			filter,
			filterText,
			sortBy,
			sortDir,
			toolbar,
			cacheable,
			...props
		}: DataTablePropsNoRef<TData>,
		ref: React.ForwardedRef<HTMLTableElement>
	) => {
		const context = useDataTable({
			table: tableProp,
			data,
			navbar,
			toolbar,
			initialData,
			limit,
			offset,
			lexicon,
			total,
			filter,
			filterText,
			sortBy,
			sortDir,
			header,
			onRowClick,
			cacheable,
		});
		return (
			<DataTableContext.Provider value={context}>
				<DataTableToolbar />
				<DataTableContent {...props} themePropsType={themePropsType} ref={ref} />
				<DataTablePagination />
			</DataTableContext.Provider>
		);
	}
) as (<TData extends object>(
	props: DataTablePropsNoRef<TData> & { ref?: React.Ref<HTMLTableElement> }
) => React.ReactElement) & {
	readonly $$typeof: symbol;
	displayName?: string | undefined;
};

DataTable.displayName = "DataTable";

type DataTableProps = React.ComponentProps<typeof DataTable>;

export { DataTable };
export type { DataTableProps };
