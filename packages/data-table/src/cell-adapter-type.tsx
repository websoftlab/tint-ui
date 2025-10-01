"use client";

import type { Header, Cell } from "@tanstack/react-table";
import type { DataTableCellAdapter, DataTableCellAdapterOptions, DataTableDisplayCell } from "./types";

import * as React from "react";
import { flexRender } from "@tanstack/react-table";
import { TableCell, TableHead, TableButtonSort } from "@tint-ui/table";
import { invariant, warningOnce } from "@tint-ui/tools/proof";
import { errorMessage } from "@tint-ui/tools/error-message";
import { adapters as coreAdapters } from "./adapters";
import { useDataTableClasses } from "./classes";
import { useDataTableContext } from "./context";

type AdaptSync = {
	adapter: DataTableCellAdapter<any>;
	options: DataTableCellAdapterOptions<any>;
};

type AdaptAsync = {
	error: string | null;
	handler: () => Promise<{ default: DataTableCellAdapter<any> }>;
	promise: Promise<void> | null;
	adapter: DataTableCellAdapter<any>;
	waiters: Set<(event: AdaptAsyncEvent) => void>;
	options: DataTableCellAdapterOptions<any>;
};

type AdaptAsyncEvent = { error: string } | { adapter: DataTableCellAdapter<any> };

type DataTableCellAdapterSyncProps<TData = any> = {
	adapt: AdaptAsync;
	type: string;
	value: unknown;
	cell: DataTableDisplayCell;
	data: TData;
};

const adapters = new Map<string, AdaptSync>();
const defaultAdapters = new Map<string, AdaptSync>();

Object.entries(coreAdapters).forEach(([name, { adapter, options }]) => {
	defaultAdapters.set(name, {
		adapter,
		options,
	});
});

const getAdapt = (type: string) => {
	const adapter = adapters.get(type) || defaultAdapters.get(type);
	if (!adapter) {
		return null;
	}
	return adapter;
};

const privateTypes: string[] = [];

const checkAdapt = (type: string) => {
	if (!type) {
		throw new Error(`Adapter type is empty`);
	}
	if (privateTypes.includes(type)) {
		throw new Error(`The ${type} type is private`);
	}
	if (adapters.has(type)) {
		throw new Error(`The ${type} form adapter already exists`);
	}
};

const hasCellAdapter = (type: string): boolean => adapters.has(type);

const addCellAdapter = function <TConfig extends object>(
	name: string,
	adapter: DataTableCellAdapter<TConfig>,
	options: DataTableCellAdapterOptions<any> = {}
): void {
	checkAdapt(name);
	adapters.set(name, {
		adapter,
		options,
	});
};

const addCellAdapterAsync = function <TConfig extends object>(
	name: string,
	handler: () => Promise<{ default: DataTableCellAdapter<TConfig> }>,
	options: DataTableCellAdapterOptions<any> = {}
): void {
	checkAdapt(name);
	adapters.set(name, {
		adapter: createAsyncAdapterCallback(name, handler, options),
		options,
	});
};

const getAsyncAdapter = function <TConfig extends object>(
	type: string,
	result: { default: DataTableCellAdapter<TConfig> }
) {
	const adapter = result?.default;
	invariant(typeof adapter === "function", `Async ${type} adapter failure: default is not function`);
	return adapter;
};

const createAsyncAdapterCallback = function <TConfig extends object>(
	type: string,
	handler: () => Promise<{ default: DataTableCellAdapter<TConfig> }>,
	options: DataTableCellAdapterOptions<any>
): DataTableCellAdapter<TConfig> {
	const adapt = {
		waiters: new Set(),
		handler,
		error: null,
		options,
	} as AdaptAsync;

	const adapter: DataTableCellAdapter<TConfig> = (value, cell, data) => {
		return <DataTableCellAdapterAsync adapt={adapt} type={type} value={value} cell={cell} data={data} />;
	};

	adapt.adapter = adapter;
	return adapter;
};

const createAsyncPromise = async (type: string, adapt: AdaptAsync) => {
	try {
		const result = await adapt.handler();
		const adapter = getAsyncAdapter(type, result);
		adapt.error = null;
		adapt.adapter = adapter;
		adapters.set(type, {
			adapter,
			options: adapt.options,
		});
	} catch (err) {
		adapt.error = errorMessage(err).message;
	}

	let event: AdaptAsyncEvent;
	if (adapt.error != null) {
		event = { error: adapt.error };
	} else if (adapt.adapter) {
		event = { adapter: adapt.adapter };
	} else {
		return;
	}

	const handlers = Array.from(adapt.waiters.values());
	adapt.waiters.clear();

	handlers.forEach((handler) => {
		handler(event);
	});
};

const DataTableCellAdapterAsync = (props: DataTableCellAdapterSyncProps) => {
	const classes = useDataTableClasses();
	const { adapt, cell, value, data, type } = props;
	const [state, setState] = React.useState<null | AdaptAsyncEvent>(() => {
		return adapt.adapter ? { adapter: adapt.adapter } : adapt.error != null ? { error: adapt.error } : null;
	});

	React.useEffect(() => {
		const { adapter, error, promise } = adapt;
		if (error != null || adapter != null) {
			return;
		}
		if (promise == null) {
			adapt.promise = createAsyncPromise(type, adapt);
		}
		adapt.waiters.add(setState);
		return () => {
			adapt.waiters.delete(setState);
		};
	}, [type, adapt]);

	if (state == null) {
		return <div className={classes.loader} />;
	}

	if ("error" in state) {
		return <div className={classes.error}>{state.error}</div>;
	}

	return <>{state.adapter(value, cell, data)}</>;
};

DataTableCellAdapterAsync.displayName = "DataTableCellAdapterAsync";

const renderDataTableCell = function <TData = object>(
	value: unknown,
	cell: DataTableDisplayCell<keyof TData>,
	data: TData
) {
	const { type = "text" } = cell;
	const adapt = getAdapt(type);
	if (!adapt) {
		warningOnce(`table-cell:${type}`, false, `The ${type} cell type not found`);
		switch (typeof value) {
			case "string":
			case "number":
			case "boolean":
				return String(value);
		}
		return null;
	}
	const { adapter } = adapt;
	if (value != null) {
		return adapter(value, cell, data);
	}
	const {
		options: { nullable },
	} = adapt;
	if (nullable) {
		return nullable(cell, data);
	}
	return null;
};

type DataTableCellNoRef<TData = object> = Omit<React.TdHTMLAttributes<HTMLTableCellElement>, "align"> & {
	cell: Cell<TData, unknown>;
	themePropsType?: string;
	withWidth?: boolean;
};

const DataTableCell = React.forwardRef(
	<TData,>(
		{ cell: tableCell, withWidth, style, ...props }: DataTableCellNoRef<TData>,
		ref: React.ForwardedRef<HTMLTableCellElement>
	) => {
		const colDef = tableCell.column.columnDef;
		const cell = (colDef.meta as { _cell?: DataTableDisplayCell })?._cell;
		const minProps = {
			...props,
			style,
			ref,
			"data-cell-id": tableCell.id,
		};
		if (!cell) {
			if (withWidth && String(tableCell.column.id).startsWith("__#")) {
				minProps.style = { ...style, width: "1%" };
			}
			return <TableCell {...minProps} />;
		}

		const { name, type = "text" } = cell;
		const adapt = getAdapt(type);
		if (!adapt) {
			return <TableCell {...minProps} data-cell-name={name} />;
		}

		let align: "start" | "center" | "end" = "start";
		const { options } = adapt;
		if (options.align) {
			align = options.align;
		}
		if (withWidth && options.width) {
			style = {
				...style,
				width: options.width,
			};
		}

		return <TableCell {...minProps} style={style} align={align} data-cell-name={name} data-cell-type={type} />;
	}
) as (<TData>(props: DataTableCellNoRef<TData> & { ref?: React.Ref<HTMLTableCellElement> }) => React.ReactElement) & {
	readonly $$typeof: symbol;
	displayName?: string | undefined;
};

DataTableCell.displayName = "DataTableCell";

type DataTableHeadPropsNoRef<TData> = Omit<React.TdHTMLAttributes<HTMLTableCellElement>, "align"> & {
	header: Header<TData, unknown>;
	themePropsType?: string;
	withWidth?: boolean;
};

const DataTableHead = React.forwardRef(
	<TData,>(
		{ header, withWidth, children, style, ...props }: DataTableHeadPropsNoRef<TData>,
		ref: React.ForwardedRef<HTMLTableCellElement>
	) => {
		const table = useDataTableContext<TData>();
		const colDef = header.column.columnDef;
		const cell = (colDef.meta as { _cell?: DataTableDisplayCell })?._cell;
		const body = header.isPlaceholder ? null : flexRender(colDef.header, header.getContext());
		const minProps = {
			...props,
			ref,
			style,
			"data-cell-id": header.id,
		};

		if (!cell || body == null) {
			if (withWidth && String(header.column.id).startsWith("__#")) {
				minProps.style = { ...style, width: "1%" };
			}
			return <TableHead {...minProps}>{body}</TableHead>;
		}

		const { name, type = "text" } = cell;

		let node: React.ReactNode = body;
		let align: "start" | "center" | "end" = "start";

		const adapt = getAdapt(type);
		if (adapt) {
			const { options } = adapt;
			if (options.align) {
				align = options.align;
			}
			if (withWidth && options.width) {
				style = {
					...style,
					width: options.width,
				};
			}
		}

		if (header.column.getCanSort()) {
			const sorted = header.column.getIsSorted();
			node = (
				<TableButtonSort
					disabled={table.loading}
					direction={sorted ? sorted : "none"}
					onClick={header.column.getToggleSortingHandler()}
				>
					{node}
				</TableButtonSort>
			);
		}

		return (
			<TableHead {...minProps} style={style} align={align} data-cell-name={name} data-cell-type={type}>
				{node}
			</TableHead>
		);
	}
) as (<TData>(
	props: DataTableHeadPropsNoRef<TData> & { ref?: React.Ref<HTMLTableCellElement> }
) => React.ReactElement) & {
	readonly $$typeof: symbol;
	displayName?: string | undefined;
};

DataTableHead.displayName = "DataTableHead";

type DataTableCellProps = React.ComponentProps<typeof DataTableCell>;
type DataTableHeadProps = React.ComponentProps<typeof DataTableHead>;

export { hasCellAdapter, addCellAdapter, addCellAdapterAsync, renderDataTableCell, DataTableCell, DataTableHead };
export type { DataTableCellProps, DataTableHeadProps };
