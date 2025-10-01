"use client";

import * as React from "react";
import clsx from "clsx";
import { Button } from "@tint-ui/button";
import { SvgThemeIcon } from "@tint-ui/svg-icon";
import { useDataTableContext } from "./context";
import { useDataTablePaginationClasses } from "./pagination-classes";
import { getPaginationNumber } from "./utils";

const PaginationNumber = React.forwardRef(
	<TData,>(
		{ className, ...props }: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>,
		ref: React.ForwardedRef<HTMLDivElement>
	) => {
		const classes = useDataTablePaginationClasses();
		const {
			loading,
			loadingTarget,
			table,
			lexicon,
			navbar: { size, numberSize },
		} = useDataTableContext<TData>();
		const pageNumber = table.getState().pagination.pageIndex + 1;
		const pageCount = table.getPageCount();
		const pages = React.useMemo(
			() => getPaginationNumber(pageNumber, pageCount, numberSize),
			[pageNumber, pageCount, numberSize]
		);
		return (
			<div {...props} className={clsx(classes.group, className)} ref={ref}>
				{pages.map((item, index) => {
					if (item.divider) {
						return (
							<span className={classes.separator} key={index}>
								<SvgThemeIcon icon="dots" />
							</span>
						);
					}
					const { page } = item;
					return (
						<Button
							key={index}
							aria-label={
								item.page === 1
									? lexicon.pageFirst
									: page === pageCount
									? lexicon.pageLast
									: String(page)
							}
							variant={item.selected ? "primary" : "outline"}
							size={size}
							onClick={() => {
								table.setPageIndex(page - 1);
							}}
							disabled={loading || item.selected}
							loading={loading && loadingTarget === `pagination:${page}`}
							iconOnly
						>
							{page}
						</Button>
					);
				})}
			</div>
		);
	}
);

PaginationNumber.displayName = "PaginationNumber";

type PaginationNumberProps = React.ComponentProps<typeof PaginationNumber>;

export { PaginationNumber };
export type { PaginationNumberProps };
