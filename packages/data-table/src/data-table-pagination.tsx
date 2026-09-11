"use client";

import * as React from "react";
import clsx from "clsx";
import { useDataTablePaginationClasses } from "./pagination-classes";
import { useDataTableContext } from "./context";
import { PaginationSizeOptions } from "./pagination-size-options";
import { PaginationArrow } from "./pagination-arrow";
import { PaginationNumber } from "./pagination-number";

const DataTablePagination = React.forwardRef<
	HTMLDivElement,
	React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
>(({ className, ...props }, ref) => {
	const classes = useDataTablePaginationClasses();
	const {
		navbar: { mode, size, pageSize, pageSizeOptions },
		table,
		totalCount,
	} = useDataTableContext();

	let min = pageSize;
	for (const value of pageSizeOptions) {
		if (value < min) {
			min = value;
		}
	}

	if (totalCount <= min && table.getPageCount() < 2) {
		return null;
	}

	return (
		<div {...props} data-navbar-size={size} className={clsx(classes.pagination, className)} ref={ref}>
			<span className={classes.divider} />
			<PaginationSizeOptions />
			{mode === "arrow" ? <PaginationArrow /> : <PaginationNumber />}
		</div>
	);
});

DataTablePagination.displayName = "DataTablePagination";

type DataTablePaginationProps = React.ComponentProps<typeof DataTablePagination>;

export { DataTablePagination };
export type { DataTablePaginationProps };
