"use client";

import type { Table } from "@tanstack/react-table";
import type { DataTableDisplayCell, FilterVisibility } from "./types";

import * as React from "react";
import { Button } from "@tint-ui/button";
import {
	DropdownMenu,
	DropdownMenuSub,
	DropdownMenuGroup,
	DropdownMenuCheckboxItem,
	DropdownMenuItem,
	DropdownMenuContent,
	DropdownMenuSubContent,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
	DropdownMenuSubTrigger,
	DropdownMenuPortal,
} from "@tint-ui/dropdown-menu";
import { useDataTableContext } from "./context";
import { SvgThemeIcon } from "@tint-ui/svg-icon";

const preventHandler = (event: { preventDefault: () => void }) => {
	event.preventDefault();
};

const menuColumns = function <TData>(table: Table<TData>) {
	return table
		.getAllColumns()
		.filter((column) => typeof column.accessorFn !== "undefined" && column.getCanHide())
		.map((column) => {
			const cell = (column.columnDef.meta as { _cell?: DataTableDisplayCell })?._cell;
			return (
				<DropdownMenuCheckboxItem
					key={column.id}
					checked={column.getIsVisible()}
					onSelect={preventHandler}
					onCheckedChange={(value) => {
						column.toggleVisibility(value);
					}}
				>
					{cell ? cell.label : column.id}
				</DropdownMenuCheckboxItem>
			);
		});
};

const menuSorts = function <TData>(table: Table<TData>) {
	return table
		.getAllColumns()
		.filter((column) => typeof column.accessorFn !== "undefined" && column.getCanSort())
		.map((column) => {
			const cell = (column.columnDef.meta as { _cell?: DataTableDisplayCell })?._cell;
			const direction = column.getIsSorted();
			const fn = column.getToggleSortingHandler();
			return (
				<DropdownMenuItem
					key={column.id}
					onSelect={(event) => {
						if (fn) {
							fn(event);
							event.preventDefault();
						}
					}}
				>
					<SvgThemeIcon icon={!direction ? "selector" : direction === "desc" ? "sort-desc" : "sort-asc"} />
					{cell ? cell.label : column.id}
				</DropdownMenuItem>
			);
		});
};

const menuFilters = function <TData>(filterVisible: FilterVisibility<TData>) {
	return filterVisible.getFilters().map((filter) => {
		const { name } = filter;
		return (
			<DropdownMenuCheckboxItem
				key={name}
				checked={filterVisible.hasFilterVisible(name)}
				onSelect={preventHandler}
				onCheckedChange={(value) => {
					filterVisible.onFilterVisibleChange(name, value);
				}}
			>
				{filter.label}
			</DropdownMenuCheckboxItem>
		);
	});
};

const menuFilterText = function <TData>(filterVisible: FilterVisibility<TData>, label: string) {
	return (
		<DropdownMenuCheckboxItem
			key="filter-text"
			checked={filterVisible.filterText}
			onSelect={preventHandler}
			onCheckedChange={(value) => {
				filterVisible.onFilterTextVisibleChange(value);
			}}
		>
			{label}
		</DropdownMenuCheckboxItem>
	);
};

export function DataTableViewOptions<TData>() {
	const {
		table,
		filterVisible,
		dynamic,
		toolbar: { size, viewIconOnly },
		lexicon,
	} = useDataTableContext<TData>();

	let count = 0;
	if (dynamic.column) {
		count++;
	}
	if (dynamic.filter) {
		count++;
	}
	if (dynamic.filterText) {
		count++;
	}
	if (dynamic.sort) {
		count++;
	}
	if (count === 0) {
		return null;
	}

	const getTitle = () => {
		if (count > 1) {
			return lexicon.viewOptions;
		}
		if (dynamic.sort) return lexicon.viewSortBy;
		if (dynamic.column) return lexicon.viewColumn;
		if (dynamic.filter) return lexicon.viewFilter;
		if (dynamic.filterText) return lexicon.viewFilterText;
		return null;
	};

	const renderOnce = () => {
		if (dynamic.sort) return menuSorts(table);
		if (dynamic.column) return menuColumns(table);
		if (dynamic.filter) return menuFilters(filterVisible);
		if (dynamic.filterText) return menuFilterText(filterVisible, lexicon.viewFilterText);
		return null;
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="outline"
					data-type="toolbar-button-options"
					size={size}
					iconLeft={<SvgThemeIcon icon="data-table-view" />}
					iconOnly={viewIconOnly}
				>
					{viewIconOnly ? null : lexicon.view}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuPortal>
				<DropdownMenuContent
					align="end"
					onCloseAutoFocus={(event) => {
						event.preventDefault();
					}}
				>
					<DropdownMenuLabel>{getTitle()}</DropdownMenuLabel>
					<DropdownMenuSeparator />
					{count > 1 ? (
						<DropdownMenuGroup>
							{dynamic.column && (
								<DropdownMenuSub>
									<DropdownMenuSubTrigger>
										<SvgThemeIcon icon="data-table-view-columns" />
										{lexicon.viewColumn}
									</DropdownMenuSubTrigger>
									<DropdownMenuPortal>
										<DropdownMenuSubContent>{menuColumns(table)}</DropdownMenuSubContent>
									</DropdownMenuPortal>
								</DropdownMenuSub>
							)}
							{dynamic.sort && (
								<DropdownMenuSub>
									<DropdownMenuSubTrigger>
										<SvgThemeIcon icon="data-table-view-sorts" />
										{lexicon.viewSortBy}
									</DropdownMenuSubTrigger>
									<DropdownMenuPortal>
										<DropdownMenuSubContent>{menuSorts(table)}</DropdownMenuSubContent>
									</DropdownMenuPortal>
								</DropdownMenuSub>
							)}
							{dynamic.filter && (
								<DropdownMenuSub>
									<DropdownMenuSubTrigger>
										<SvgThemeIcon icon="data-table-view-filters" />
										{lexicon.viewFilter}
									</DropdownMenuSubTrigger>
									<DropdownMenuPortal>
										<DropdownMenuSubContent>{menuFilters(filterVisible)}</DropdownMenuSubContent>
									</DropdownMenuPortal>
								</DropdownMenuSub>
							)}
							{dynamic.filterText && menuFilterText(filterVisible, lexicon.viewFilterText)}
						</DropdownMenuGroup>
					) : (
						renderOnce()
					)}
				</DropdownMenuContent>
			</DropdownMenuPortal>
		</DropdownMenu>
	);
}
