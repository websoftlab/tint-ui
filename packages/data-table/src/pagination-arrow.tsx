"use client";

import * as React from "react";
import clsx from "clsx";
import { Button } from "@tint-ui/button";
import { SvgThemeIcon } from "@tint-ui/svg-icon";
import { useDataTableContext } from "./context";
import { useDataTablePaginationClasses } from "./pagination-classes";
import { useLayer } from "@tint-ui/theme";

const PaginationArrow = React.forwardRef(
	<TData,>(
		{ className, ...props }: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>,
		ref: React.ForwardedRef<HTMLDivElement>
	) => {
		const classes = useDataTablePaginationClasses();
		const {
			loading,
			table,
			lexicon,
			navbar: { size },
		} = useDataTableContext<TData>();
		const layer = useLayer();
		const pageCount = table.getPageCount();
		return (
			<div {...props} className={clsx(classes.group, className)} ref={ref}>
				{pageCount > 1 && <span>{lexicon.pageOf}</span>}
				<Button
					aria-label={lexicon.pageFirst}
					data-id={layer.dataId("table-page-first")}
					variant="outline"
					size={size}
					className={classes.firstLast}
					onClick={() => {
						table.setPageIndex(0);
					}}
					disabled={loading || !table.getCanPreviousPage()}
					iconOnly
					iconLeft={<SvgThemeIcon icon="pagination-first" aria-hidden="true" />}
				/>
				<Button
					aria-label={lexicon.pagePrevious}
					data-id={layer.dataId("table-page-previous")}
					variant="outline"
					size={size}
					className={classes.previousNext}
					onClick={() => {
						table.previousPage();
					}}
					disabled={loading || !table.getCanPreviousPage()}
					iconOnly
					iconLeft={<SvgThemeIcon icon="pagination-previous" aria-hidden="true" />}
				/>
				<Button
					aria-label={lexicon.pageNext}
					data-id={layer.dataId("table-page-next")}
					variant="outline"
					size={size}
					className={classes.previousNext}
					onClick={() => {
						table.nextPage();
					}}
					disabled={loading || !table.getCanNextPage()}
					iconOnly
					iconRight={<SvgThemeIcon icon="pagination-next" aria-hidden="true" />}
				/>
				<Button
					aria-label={lexicon.pageLast}
					data-id={layer.dataId("table-page-last")}
					variant="outline"
					size={size}
					className={classes.firstLast}
					onClick={() => {
						table.setPageIndex(table.getPageCount() - 1);
					}}
					disabled={loading || !table.getCanNextPage()}
					iconOnly
					iconRight={<SvgThemeIcon icon="pagination-last" aria-hidden="true" />}
				/>
			</div>
		);
	}
);

PaginationArrow.displayName = "PaginationArrow";

type PaginationArrowProps = React.ComponentProps<typeof PaginationArrow>;

export { PaginationArrow };
export type { PaginationArrowProps };
