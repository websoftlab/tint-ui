"use client";

import {
	FilterData,
	DataTableCallbackType,
	DataTableCellType,
	DataTableDisplayCell,
	DataTableCoreProps,
	DataTableContextType,
	RowMenuOption,
	DataTableDisplayFilter,
} from "./types";
import type {
	FilterFn,
	ColumnFilter,
	ColumnSort,
	SortingState,
	PaginationState,
	ColumnDef,
	ColumnFiltersState,
} from "@tanstack/react-table";

import * as React from "react";
import {
	useReactTable,
	getCoreRowModel,
	getPaginationRowModel,
	getFilteredRowModel,
	getSortedRowModel,
} from "@tanstack/react-table";
import { errorMessage } from "@tint-ui/tools/error-message";
import { useVisibilityColumn } from "./use-visibility-column";
import { renderDataTableCell } from "./cell-adapter-type";
import { useLexicon } from "./use-lexicon";
import { useVisibilityFilter } from "./use-visibility-filter";
import { filterBoolean, filterNumber, filterNumberMultiple, filterString, filterStringMultiple } from "./filter-fn";
import { rowButtonMenu } from "./row-button-menu";
import { rowPopoverMenu } from "./row-popover-menu";
import { diffFilterId, getNavbarConfig, getToolbarConfig } from "./utils";

const createHash = function <TData extends object>(
	name: string,
	keyName: string,
	manual: boolean,
	cells: DataTableCellType<keyof TData>[]
) {
	let hash = `${name}[${keyName},${manual ? "1" : "0"}]://`;
	for (const cell of cells) {
		hash += ":" + (cell.type || "text") + "/" + String(cell.name);
	}
	return hash;
};

const displayType = function <TData extends object>(cell: DataTableCellType<keyof TData>) {
	const {
		type = "text",
		name,
		config = {},
		defaultSortDir = "asc",
		label,
		hidden = false,
		required = false,
		searchable = type === "text",
		sortable = false,
		invisible = false,
	} = cell;

	let { filter: inputFilter = null } = cell;
	const displayCell: DataTableDisplayCell<keyof TData> = {
		type,
		name,
		config,
		defaultSortDir,
		label,
		hidden,
		invisible,
		required,
		searchable,
		sortable,
		filter: inputFilter != null,
	};

	let filter: DataTableDisplayFilter<keyof TData> | null = null;
	let filterFn: FilterFn<TData> | undefined = undefined;

	if (inputFilter != null) {
		if (Array.isArray(inputFilter) || typeof inputFilter === "function") {
			inputFilter = { type: "option", config: { options: inputFilter } };
		}

		const { type: adapterType = "option", multiple = false, config = {} } = inputFilter;

		let { valueType } = inputFilter;
		if (!valueType) {
			if (type === "boolean" || type === "number") {
				valueType = type;
			} else {
				valueType = "string";
			}
		}

		filter = {
			name,
			type: adapterType,
			valueType: valueType,
			multiple: multiple && type !== "boolean",
			label: inputFilter.label || label,
			hidden: typeof inputFilter.hidden === "boolean" ? inputFilter.hidden : hidden,
			required: typeof inputFilter.required === "boolean" ? inputFilter.required : required,
			config,
		};

		switch (valueType) {
			case "boolean":
				filterFn = filterBoolean;
				break;
			case "number":
				filterFn = multiple ? filterNumberMultiple : filterNumber;
				break;
			case "string":
				filterFn = multiple ? filterStringMultiple : filterString;
				break;
		}
	}

	return { cell: displayCell, filter, filterFn };
};

const initialDataState = function <TData extends object = object>(
	data: TData[] | DataTableCallbackType<TData>,
	initialData: TData[] | undefined
) {
	if (Array.isArray(initialData)) {
		return initialData;
	}
	if (typeof data === "function") {
		return [];
	}
	return Array.isArray(data) ? data : [];
};

const createFilterState = function <TData extends object>(
	props: DataTableCoreProps<TData>,
	opts: {
		data: TData[];
		manual: boolean;
		pageSizeOptions: number[];
		hash: string;
	}
) {
	const { offset = 0, filter, sortBy, sortDir, filterText = "" } = props;
	const { data, manual, pageSizeOptions, hash } = opts;

	let { total } = props;
	if (!manual) {
		total = data.length;
	}

	let { limit } = props;
	if (limit == null) {
		limit = pageSizeOptions[0];
	}

	let pageIndex = 0;
	if (offset > 0 && offset >= limit) {
		pageIndex = (offset - (offset % limit)) / limit;
	}

	const columnFilters: ColumnFilter[] = [];
	const pagination: PaginationState = { pageIndex, pageSize: limit };
	if (filter != null) {
		applyFilter(columnFilters, filter);
	}

	const sorting: SortingState = [];
	if (sortBy != null) {
		sorting.push({
			id: sortBy as string,
			desc: sortDir == null ? false : sortDir === "desc",
		});
	}

	return {
		hash,
		error: null as string | null,
		loading: false,
		loadingTarget: null as string | null,
		totalCount: total == null ? -1 : total,
		pageCount: getPageCount(total, limit),
		sorting,
		globalFilter: filterText,
		columnFilters,
		pagination,
		selected: [] as number[], // todo
	};
};

const applyFilter = function <TData extends object = object>(
	columnFilters: ColumnFilter[],
	filter: Record<keyof TData, unknown>
) {
	for (const key in filter) {
		const value = filter[key];
		if (value != null)
			columnFilters.push({
				id: key,
				value,
			});
	}
};

const defaultPageSize = 25;

const getPageCount = (total: number | null | undefined, limit: number) => {
	return total == null ? -1 : total > limit ? Math.ceil(total / limit) : 1;
};

const useDataTable = function <TData extends object>(props: DataTableCoreProps<TData>): DataTableContextType<TData> {
	const { table, header, cacheable = true, onRowClick, toolbar: toolbarProp, navbar: navbarProp } = props;
	const {
		name,
		keyName = "id",
		cells: tableCells,
		rowMenu: rowMenuProp = null,
		storage = false,
		ssr = true,
		requiredFilterText = false,
	} = table;

	// manual (dynamic) table or not
	const refDataFn = React.useRef<DataTableCallbackType<TData> | null>(null);
	refDataFn.current = typeof props.data === "function" ? props.data : null;
	const manual = refDataFn.current != null;

	const hash = createHash(name, keyName, manual, tableCells);
	const refHash = React.useRef(hash);

	const [data, setData] = React.useState(() => initialDataState(props.data, props.initialData));
	const toolbar = getToolbarConfig(toolbarProp);
	const navbar = getNavbarConfig(navbarProp, props.limit || defaultPageSize);
	const [state, setState] = React.useState(() =>
		createFilterState(props, {
			data,
			pageSizeOptions: navbar.pageSizeOptions,
			manual,
			hash,
		})
	);

	// read page size from state
	navbar.pageSize = state.pagination.pageSize;

	const {
		onMount,
		onReload,
		onFilterReset,
		onPageSizeChange,
		onColumnFiltersChange,
		onSortingChange,
		onGlobalFilterChange,
		onPaginationChange,
	} = React.useMemo(() => {
		let mount = false;
		let lazyId: number | null = null;
		let waitTime = 0;

		const clearTimeout = () => {
			if (lazyId != null) {
				window.clearTimeout(lazyId);
				lazyId = null;
			}
		};

		const compareHash = (hash: string) => {
			return refHash.current === hash;
		};

		const query = (newState: typeof state, loadingTarget: string | null = null) => {
			const fn = refDataFn.current;
			if (!fn || !mount) {
				return false;
			}

			waitTime = 0;

			const queryHash = refHash.current;
			const asyncFn = async (data: FilterData<TData>) => fn(data);
			const {
				pagination: { pageIndex, pageSize },
				sorting,
				columnFilters,
				globalFilter,
			} = newState;

			const sort = sorting[0];
			const data = {
				filter: {},
				filterText: globalFilter,
				limit: pageSize,
				offset: pageIndex > 0 ? pageIndex * pageSize : 0,
				sortBy: sort == null ? null : sort.id,
				sortDir: sort != null && sort.desc ? "desc" : "asc",
			} as FilterData<TData>;

			for (const filter of columnFilters) {
				data.filter[filter.id as keyof TData] = filter.value;
			}

			// check loading status
			setState((prev) => {
				if (prev.loading) {
					return prev;
				}
				return { ...prev, loading: true, loadingTarget };
			});

			asyncFn(data)
				.then((result) => {
					if (!mount || !compareHash(queryHash)) {
						return;
					}
					const { data, total, filter, sortBy, sortDir, filterText, limit, offset = 0 } = result;
					setData(data);
					setState((prev) => {
						const columnFilters: ColumnFilter[] = [];
						if (filter != null) {
							applyFilter(columnFilters, filter);
						}
						const pageSize = limit;
						const pageIndex = offset >= pageSize ? (offset - (offset % pageSize)) / pageSize : 0;
						return {
							hash: prev.hash,
							selected: [], // todo find selected in new data
							pagination: { pageSize, pageIndex },
							columnFilters,
							globalFilter: typeof filterText === "string" ? filterText : "",
							sorting:
								sortBy == null
									? []
									: [
											{
												id: sortBy,
												desc: sortDir == null ? false : sortDir === "desc",
											} as ColumnSort,
									  ],
							totalCount: total,
							pageCount: getPageCount(total, pageSize),
							loading: false,
							loadingTarget: null,
							error: null,
						};
					});
				})
				.catch((err) => {
					if (!mount || !compareHash(queryHash)) {
						return;
					}
					setState((prev) => ({
						...prev,
						loading: false,
						loadingTarget: null,
						error: errorMessage(err).message,
					}));
				});

			return true;
		};

		const force = (newState: typeof state, lazy = false, loadingTarget: string | null = null) => {
			const fn = refDataFn.current;
			if (!fn) {
				return false;
			}
			const queryHash = refHash.current;

			// lazy, wait
			if (lazy) {
				const now = Date.now();
				if (waitTime === 0 || now - waitTime < 2500) {
					clearTimeout();
					if (waitTime === 0) {
						waitTime = now;
					}
					lazyId = window.setTimeout(() => {
						if (compareHash(queryHash)) {
							force(newState, false, loadingTarget);
						}
					}, 200);
					return false;
				}
			}

			return query(newState, loadingTarget);
		};

		return {
			onMount() {
				mount = true;
				return () => {
					mount = false;
				};
			},
			onReload(reloadState: typeof state) {
				query(reloadState, "reload");
			},
			onFilterReset() {
				if (!mount) {
					return;
				}
				setState((prev) => {
					if (prev.loading) {
						return prev;
					}
					const state = {
						...prev,
						columnFilters: [],
						globalFilter: "",
					};
					if (force(state)) {
						state.loading = true;
						state.loadingTarget = "reset";
					}
					return state;
				});
			},
			onPageSizeChange(pageSize: number) {
				setState((prev) => {
					if (prev.loading || prev.pagination.pageSize === pageSize) {
						return prev;
					}
					const state = {
						...prev,
						pagination: { pageSize, pageIndex: 0 },
					};
					if (force(state)) {
						state.loading = true;
						state.loadingTarget = "page-size";
					}
					return state;
				});
			},
			onGlobalFilterChange(value: string | ((value: string) => string)) {
				setState((prev) => {
					if (prev.loading) {
						return prev;
					}
					const { globalFilter, ...rest } = prev;
					if (typeof value === "function") {
						value = value(globalFilter);
					}
					const state = {
						...rest,
						globalFilter: value == null ? "" : String(value),
					};
					if (force(state, true, "filter-text")) {
						state.loading = true;
						state.loadingTarget = "filter-text";
					}
					return state;
				});
			},
			onColumnFiltersChange(value: ColumnFiltersState | ((value: ColumnFiltersState) => ColumnFiltersState)) {
				setState((prev) => {
					if (prev.loading) {
						return prev;
					}
					const { columnFilters, ...rest } = prev;
					if (typeof value === "function") {
						value = value(columnFilters);
					}
					value = value.filter(({ value }) =>
						Array.isArray(value) ? value.length > 0 : value != null && value !== ""
					);
					const state = {
						...rest,
						columnFilters: value,
					};
					if (force(state)) {
						state.loading = true;
						state.loadingTarget = "filter:" + diffFilterId(columnFilters, state.columnFilters);
					}
					return state;
				});
			},
			onSortingChange(value: SortingState | ((value: SortingState) => SortingState)) {
				setState((prev) => {
					if (prev.loading) {
						return prev;
					}
					const { sorting, ...rest } = prev;
					const state = {
						...rest,
						error: null,
						sorting: typeof value === "function" ? value(sorting) : value,
						loading: false,
					};
					if (force(state)) {
						state.loading = true;
						const first = sorting[0];
						if (first) {
							state.loadingTarget = `sorting:${first.id}`;
						}
					}
					return state;
				});
			},
			onPaginationChange(value: PaginationState | ((value: PaginationState) => PaginationState)) {
				setState((prev) => {
					if (prev.loading) {
						return prev;
					}
					const { pagination, ...rest } = prev;
					const state = {
						...rest,
						pagination: typeof value === "function" ? value(pagination) : value,
						error: null,
						loading: false,
					};
					if (force(state)) {
						state.loading = true;
						state.loadingTarget = "pagination:" + (state.pagination.pageIndex + 1);
					}
					return state;
				});
			},
		};
	}, [hash]);

	React.useEffect(onMount, [onMount]);

	const currentData = !cacheable && !manual && Array.isArray(props.data) ? props.data : null;
	React.useEffect(() => {
		if (currentData != null && data != currentData) {
			setData(currentData);
		}
	}, [currentData, data]);

	React.useEffect(() => {
		let dataState = data;
		let filterState = state;
		if (refHash.current !== hash) {
			refHash.current = hash;

			// update data state
			dataState = initialDataState(props.data, props.initialData);
			setData(dataState);

			// update filter state
			filterState = createFilterState(props, {
				data: dataState,
				pageSizeOptions: navbar.pageSizeOptions,
				manual,
				hash,
			});
			setState(filterState);
		}

		// load table if empty
		if (manual && dataState.length === 0) {
			onReload(filterState);
		}
	}, [hash]);

	const { cells, filters, columns, dynamic, filterText, invisible } = React.useMemo(() => {
		const cells: DataTableDisplayCell<keyof TData>[] = [];
		const columns: ColumnDef<TData>[] = [];
		const filters: DataTableDisplayFilter<keyof TData>[] = [];
		const invisible: { [key: string]: boolean } = {};
		const dynamic = {
			column: false,
			sort: false,
			filter: false,
			filterText: false,
		};
		let filterText = false;
		for (const cell of tableCells) {
			const { cell: requiredCell, filter, filterFn } = displayType(cell);
			const { name, sortable, defaultSortDir, searchable, required } = requiredCell;
			if (cell.invisible) {
				invisible[cell.name] = true;
			}
			cells.push(requiredCell);
			if (filter != null) {
				filters.push(filter);
				dynamic.filter = true;
			}
			if (sortable) {
				dynamic.sort = true;
			}
			if (searchable) {
				filterText = true;
				if (!requiredFilterText) {
					dynamic.filterText = true;
				}
			}
			if (!required) {
				dynamic.column = true;
			}
			columns.push({
				accessorKey: name,
				cell: (info) => renderDataTableCell<TData>(info.getValue(), requiredCell, info.row.original),
				header: () => cell.label,
				footer: () => cell.label,
				filterFn,
				enableHiding: !required && !cell.invisible,
				enableSorting: sortable,
				sortDescFirst: defaultSortDir === "desc",
				enableColumnFilter: filter != null,
				enableGlobalFilter: searchable,
				meta: {
					_cell: requiredCell,
				},
			});
		}

		let menu: RowMenuOption<TData>[] = [];
		let mode: "button" | "popover" | null = null;
		let alignStart = false;
		if (rowMenuProp != null) {
			if (Array.isArray(rowMenuProp)) {
				menu = rowMenuProp;
			} else {
				menu = rowMenuProp.menu;
				if (rowMenuProp.mode) {
					mode = rowMenuProp.mode;
				}
				if (rowMenuProp.align === "start") {
					alignStart = true;
				}
			}
			if (!mode) {
				mode = menu.length > 4 ? "popover" : "button";
			}
		} else {
			mode = "button";
		}

		if (menu.length > 0) {
			const column: ColumnDef<TData> = {
				accessorKey: "__#menu",
				cell: mode === "button" ? (info) => rowButtonMenu(info, menu) : (info) => rowPopoverMenu(info, menu),
				header: "",
				footer: "",
				enableHiding: false,
				enableSorting: false,
				enableColumnFilter: false,
				enableGlobalFilter: false,
			};
			alignStart ? columns.unshift(column) : columns.push(column);
		}

		// todo selectable mode...

		return {
			columns,
			filters,
			cells,
			dynamic,
			filterText,
			invisible,
		};
	}, [hash]);

	const [columnVisibility, onColumnVisibilityChange] = useVisibilityColumn(name, cells, { storage, ssr });

	const filterVisible = useVisibilityFilter<TData>(name, filters, filterText, { storage, ssr, requiredFilterText });

	const top = header === "top" || header === "both";
	let bottom = header === "bottom" || header === "both";
	if (data.length < 7 && top && bottom) {
		bottom = false;
	}

	const { loading } = state;
	const getRowClickHandler = React.useCallback(
		(data: TData) => {
			if (!onRowClick || loading) {
				return undefined;
			}
			return (event: React.MouseEvent) => {
				const target = event.target as HTMLElement;
				if ("closest" in target && !target.closest("a[href],button,input,select,textarea,[role=button]")) {
					onRowClick(data);
				}
			};
		},
		[onRowClick, loading]
	);

	const { pagination } = state;
	const tableCtx = useReactTable({
		data,
		columns,
		pageCount: manual ? state.pageCount : undefined,
		state: {
			columnVisibility,
			sorting: state.sorting,
			globalFilter: state.globalFilter,
			columnFilters: state.columnFilters,
			pagination,
		},
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getSortedRowModel: getSortedRowModel(),
		globalFilterFn: "auto",
		onColumnFiltersChange,
		onGlobalFilterChange,
		onColumnVisibilityChange,
		onSortingChange,
		onPaginationChange,
		manualFiltering: manual,
		manualSorting: manual,
		manualPagination: manual,
	});

	// lexicon page config
	const limit = pagination.pageSize;
	const offset = pagination.pageIndex * limit;

	let totalCount = state.totalCount;
	let size = data.length;
	let pageCount = state.pageCount;
	if (!manual) {
		totalCount = data.length;
		pageCount = tableCtx.getPageCount();
		const end = offset + limit;
		size = end > totalCount ? limit - end + totalCount : limit;
	}

	const lexicon = useLexicon(props.lexicon || {}, {
		limit,
		offset,
		pageNumber: pagination.pageIndex + 1,
		pageCount,
		total: totalCount,
		size,
		selected: state.selected.length,
	});

	console.log("state.loadingTarget", state.loadingTarget);
	return {
		hash,
		data,
		cells,
		filters,
		dynamic,
		totalCount,
		lexicon,
		getRowClickHandler,
		filterVisible,
		manual,
		loading,
		loadingTarget: state.loadingTarget,
		header: {
			top,
			bottom,
		},
		toolbar: {
			...toolbar,
			onFilterReset,
		},
		navbar: {
			...navbar,
			onPageSizeChange,
		},
		table: tableCtx,
		error: state.error,
		invisible,
	};
};

export { useDataTable };
