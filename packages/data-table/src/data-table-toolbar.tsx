"use client";

import * as React from "react";
import clsx from "clsx";
import { Button } from "@tint-ui/button";
import { SvgThemeIcon } from "@tint-ui/svg-icon";
import { SlideNavigator, Slide } from "@tint-ui/slide-navigator";
import { useMediaQuery } from "@tint-ui/tools/use-media-query";
import { useDataTableContext } from "./context";
import { useDataTableToolbarClasses } from "./toolbar-classes";
import { DataTableViewOptions } from "./data-table-views-options";
import { DataTableTextFilter } from "./data-table-text-filter";
import { renderDataTableFilter } from "./filter-adapter-type";

// label
const DataTableToolbar = React.forwardRef<
	HTMLDivElement,
	React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
>(({ className, ...props }, ref) => {
	const classes = useDataTableToolbarClasses();
	const {
		lexicon,
		table,
		filterVisible,
		toolbar: { size, resetIconOnly, onFilterReset },
	} = useDataTableContext();

	const isMobile = useMediaQuery("(max-width: 639px)", { noSsr: true });
	const state = table.getState();
	const isFiltered = state.columnFilters.length > 0 || String(state.globalFilter ?? "").length > 0;
	const filters = filterVisible.getVisibleFilters();
	const isHeading = filters.length === 0 && !filterVisible.filterText && !isFiltered;

	let body: React.ReactNode;
	if (isHeading) {
		body = (
			<>
				<h2 className={classes.heading}>{lexicon.title}</h2>
				<DataTableViewOptions />
			</>
		);
	} else {
		const col1 = filterVisible.filterText ? (
			<div key="search" className={classes.search}>
				<DataTableTextFilter isMobile={isMobile} />
			</div>
		) : (
			<h2 key="heading" className={classes.heading}>
				{lexicon.title}
			</h2>
		);
		const col2 =
			filters.length > 0 ? (
				<SlideNavigator key="filters" size={size} arrow="auto" className={classes.filters}>
					{filters.map((filter) => (
						<Slide key={filter.name} asChild>
							{renderDataTableFilter(filter)}
						</Slide>
					))}
				</SlideNavigator>
			) : isMobile ? null : (
				<div key="empty-filters" className={classes.filters} />
			);
		const col3 = (
			<div key="reset" className={classes.reset}>
				{isFiltered && (
					<Button
						variant="secondary"
						data-type="toolbar-button-reset"
						size={size}
						onClick={onFilterReset}
						iconLeft={<SvgThemeIcon icon="x" aria-hidden="true" />}
						iconOnly={resetIconOnly}
					>
						{resetIconOnly ? null : lexicon.filterReset}
					</Button>
				)}
			</div>
		);
		const col4 = (
			<div key="options" className={classes.options}>
				<DataTableViewOptions />
			</div>
		);

		body = isMobile ? (
			<>
				<div className={classes.mobile}>
					{col1}
					{col3}
					{col4}
				</div>
				{col2 == null ? null : <div className={classes.mobile}>{col2}</div>}
			</>
		) : (
			<>
				{col1}
				{col2}
				{col3}
				{col4}
			</>
		);
	}

	return (
		<div
			{...props}
			data-size={size}
			className={clsx(
				className,
				classes.toolbar,
				!isHeading && (isMobile ? classes.withFilterGroup : classes.withFilter)
			)}
			ref={ref}
		>
			{body}
		</div>
	);
});

DataTableToolbar.displayName = "DataTableToolbar";

type DataTableToolbarProps = React.ComponentProps<typeof DataTableToolbar>;

export { DataTableToolbar };
export type { DataTableToolbarProps };
