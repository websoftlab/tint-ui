import * as React from "react";
import type { Table } from "@tanstack/react-table";
import type { InputSelectOption } from "@tint-ui/tools";
import type { TriggerProp } from "@tint-ui/trigger";

interface FilterRangeType {
	total?: number;
	limit?: number;
	offset?: number;
}

interface FilterType<TData> extends FilterRangeType {
	filter?: Record<keyof TData, unknown>;
	filterText?: string;
	sortBy?: keyof TData | string | null;
	sortDir?: "asc" | "desc";
}

interface OptionTrigger<TData> {
	id: string;
	trigger?: TriggerProp;
	label: string;
	enabledKey?: keyof TData | string;
	icon?: string;
	destructive?: boolean;
	confirmation?: string | null;
}

export type RowMenuOption<TData> = OptionTrigger<TData> & {
	onClick?: (data: TData) => void;
	triggerKey?: keyof TData;
};

export type SelectedOption<TData> = OptionTrigger<TData> & {
	separate?: boolean;
	onClick?: (ids: unknown[]) => void;
};

export type DataTableToolbarSize = "sm" | "md" | "lg";

export type DataTableNavbarSize = "sm" | "md" | "lg";

export interface DataTableCoreProps<TData> extends FilterType<TData> {
	table: DataTableType<TData>;
	data: TData[] | DataTableCallbackType<TData>;
	initialData?: TData[];
	lexicon?: Partial<DataTableLexicon>;
	header?: "top" | "bottom" | "both" | "none";
	onRowClick?: (data: TData) => void;
	toolbar?: { size?: DataTableToolbarSize; viewIconOnly?: boolean; resetIconOnly?: boolean } | null;
	navbar?: Partial<Omit<NavbarConfig, "onPageSizeChange">> | null;
	compact?: boolean;
	cacheable?: boolean;
}

export type StringOrFn = string | (() => string);

export interface DataTableLexicon {
	filterSearch: string | ((data: { label: string }) => string);
	filterSelected: string | ((data: { selected: number }) => string);
	filterClear: StringOrFn;
	filterReset: StringOrFn;
	filterNotFound: StringOrFn;
	view: StringOrFn;
	viewOptions: StringOrFn;
	viewFilterText: StringOrFn;
	viewFilter: StringOrFn;
	viewSortBy: StringOrFn;
	viewColumn: StringOrFn;
	pageFirst: StringOrFn;
	pageLast: StringOrFn;
	pagePrevious: StringOrFn;
	pageNext: StringOrFn;
	notFound: StringOrFn;
	notFoundFiltered: StringOrFn;
	search: StringOrFn;
	selected: string | ((data: { selected: number; size: number }) => string);
	onePageTitle: string | ((data: { size: number }) => string);
	pageOf: string | ((data: { pageNumber: number; pageCount: number }) => string);
	title:
		| string
		| ((data: {
				size: number;
				total: number;
				limit: number;
				offset: number;
				pageNumber: number;
				pageCount: number;
		  }) => string);
}

export type DataTableResponse<TData> = {
	data: TData[];
} & Omit<FilterType<TData>, keyof FilterRangeType> &
	Required<FilterRangeType>;

export type FilterData<TData> = Required<FilterType<TData>>;

export type DataTableCallbackType<TData> = (
	filter: FilterData<TData>
) => DataTableResponse<TData> | Promise<DataTableResponse<TData>>;

export interface DataTableType<TData> {
	name: string;
	keyName?: string;
	selectable?: SelectedOption<TData>[];
	cells: DataTableCellType<keyof TData>[];
	storage?: boolean | string;
	ssr?: boolean;
	rowMenu?:
		| null
		| { mode?: "button" | "popover"; align?: "start" | "end"; menu: RowMenuOption<TData>[] }
		| RowMenuOption<TData>[];
	requiredFilterText?: boolean;
}

export interface DataTableCellType<TValue = string, TConfig extends object = any> {
	name: TValue extends string ? TValue : string;
	label: string;
	type?: "text" | "number" | "date" | "boolean" | string;
	required?: boolean;
	hidden?: boolean;
	invisible?: boolean;
	sortable?: boolean;
	searchable?: boolean;
	config?: TConfig;
	defaultSortDir?: "asc" | "desc";
	filter?: InputSelectOption[] | FilterOptionCallbackType | DataTableFilterType | null;
}

export interface DataTableFilterType<FConfig extends object = any> {
	type?: "option" | string;
	valueType?: "string" | "number" | "boolean";
	label?: string;
	multiple?: boolean;
	config?: FConfig;
	hidden?: boolean;
	required?: boolean;
}

export interface DataTableFilterOptionConfig {
	options: InputSelectOption[] | FilterOptionCallbackType;
	type?: "string" | "number" | "boolean";
	initialOptions?: InputSelectOption[];
	icon?: string;
	disableSearch?: boolean;
	autoSelect?: boolean;
	groupBy?: string;
}

export type DataTableDisplayCell<TValue = string, TConfig extends object = any> = Required<
	Omit<DataTableCellType<TValue, TConfig>, "filter">
> & {
	filter: boolean;
};

export type DataTableDisplayFilter<TName = string, FConfig extends object = any> = Required<
	DataTableFilterType<FConfig>
> & {
	name: TName extends string ? TName : string;
};

/**
 * The mode of the option query.
 */
export type FilterOptionQueryMode = "initial" | "lost" | "search";

/**
 * The type of the option callback for dynamic options.
 */
export type FilterOptionCallbackType<T = string> = (
	text: string,
	values: T[],
	mode: FilterOptionQueryMode,
	abortController: AbortController
) => InputSelectOption[] | Promise<InputSelectOption[]>;

export type DataTableCellAdapter<TConfig extends object, TValue = string, TData = any> = (
	value: unknown,
	cell: DataTableDisplayCell<TValue, TConfig>,
	data: TData
) => React.ReactNode;

export type DataTableCellAdapterOptions<TConfig extends object, TValue = string, TData = any> = {
	nullable?: (cell: DataTableDisplayCell<TValue, TConfig>, data: TData) => React.ReactNode;
	width?: string | number;
	align?: "start" | "end" | "center";
};

export type DataTableFilterAdapter<TName = string, FConfig extends object = any> = (
	filter: DataTableDisplayFilter<TName, FConfig>
) => React.ReactNode;

export type FilterVisibility<TData> = {
	filterText: boolean;
	getVisibleFilters(): DataTableDisplayFilter<keyof TData>[];
	getFilters(): DataTableDisplayFilter<keyof TData>[];
	hasFilterVisible(name: keyof TData | string): boolean;
	onFilterVisibleChange(name: keyof TData | string, visible: boolean): void;
	onFilterTextVisibleChange(visible: boolean): void;
};

export type LexiconType = {
	readonly [key in keyof Omit<DataTableLexicon, "filterSearch" | "filterSelected">]: string;
} & {
	filterSearch(label: string): string;
	filterSelected(selected: number): string;
};

export type ToolbarConfig = {
	size: DataTableToolbarSize;
	viewIconOnly: boolean;
	resetIconOnly: boolean;
	onFilterReset(): void;
};

export type NavbarConfig = {
	size: DataTableNavbarSize;
	pageSize: number;
	numberSize: number;
	pageSizeOptions: number[];
	mode: "arrow" | "number";
	onPageSizeChange(value: number): void;
};

export type DynamicConfig = {
	column: boolean;
	sort: boolean;
	filter: boolean;
	filterText: boolean;
};

export type HeaderConfig = {
	top: boolean;
	bottom: boolean;
};

export type DataTableContextType<TData> = {
	hash: string;
	data: TData[];
	table: Table<TData>;
	cells: DataTableDisplayCell<keyof TData>[];
	filters: DataTableDisplayFilter<keyof TData>[];
	dynamic: DynamicConfig;
	loading: boolean;
	loadingTarget: string | null;
	error: string | null;
	invisible: { [key: string]: boolean | undefined };
	totalCount: number;
	lexicon: LexiconType;
	header: HeaderConfig;
	toolbar: ToolbarConfig;
	navbar: NavbarConfig;
	filterVisible: FilterVisibility<TData>;
	manual: boolean;
	getRowClickHandler(data: TData): ((event: React.MouseEvent) => void) | undefined;
};
