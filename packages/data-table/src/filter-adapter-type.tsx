"use client";

import type { DataTableFilterAdapter, DataTableDisplayFilter } from "./types";

import * as React from "react";
import { invariant, warningOnce } from "@tint-ui/tools/proof";
import { errorMessage } from "@tint-ui/tools/error-message";
import { adapters as coreAdapters } from "./filter-adapters";
import { useDataTableClasses } from "./classes";

type AdaptSync = {
	adapter: DataTableFilterAdapter;
};

type AdaptAsync = {
	error: string | null;
	handler: () => Promise<{ default: DataTableFilterAdapter }>;
	promise: Promise<void> | null;
	adapter: DataTableFilterAdapter<any>;
	waiters: Set<(event: AdaptAsyncEvent) => void>;
};

type AdaptAsyncEvent = { error: string } | { adapter: DataTableFilterAdapter };

type DataTableFilterAdapterSyncProps = {
	adapt: AdaptAsync;
	type: string;
	filter: DataTableDisplayFilter;
};

const adapters = new Map<string, AdaptSync>();
const defaultAdapters = new Map<string, AdaptSync>();

Object.entries(coreAdapters).forEach(([name, { adapter }]) => {
	defaultAdapters.set(name, {
		adapter,
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

const hasFilterAdapter = (type: string): boolean => adapters.has(type);

const addFilterAdapter = function (name: string, adapter: DataTableFilterAdapter): void {
	checkAdapt(name);
	adapters.set(name, {
		adapter,
	});
};

const addFilterAdapterAsync = function (
	name: string,
	handler: () => Promise<{ default: DataTableFilterAdapter }>
): void {
	checkAdapt(name);
	adapters.set(name, {
		adapter: createAsyncAdapterCallback(name, handler),
	});
};

const getAsyncAdapter = function (type: string, result: { default: DataTableFilterAdapter }) {
	const adapter = result?.default;
	invariant(typeof adapter === "function", `Async ${type} adapter failure: default is not function`);
	return adapter;
};

const createAsyncAdapterCallback = function (
	type: string,
	handler: () => Promise<{ default: DataTableFilterAdapter }>
): DataTableFilterAdapter {
	const adapt = {
		waiters: new Set(),
		handler,
		error: null,
	} as AdaptAsync;

	const adapter: DataTableFilterAdapter = (filter) => {
		return <DataTableFilterAdapterAsync adapt={adapt} type={type} filter={filter} />;
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

const DataTableFilterAdapterAsync = (props: DataTableFilterAdapterSyncProps) => {
	const classes = useDataTableClasses();
	const { adapt, filter, type } = props;
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

	return <>{state.adapter(filter)}</>;
};

DataTableFilterAdapterAsync.displayName = "DataTableFilterAdapterAsync";

const renderDataTableFilter = function <TName = string, FConfig extends object = any>(
	filter: DataTableDisplayFilter<TName, FConfig>
) {
	const { type = "option" } = filter;
	const adapt = getAdapt(type);
	if (!adapt) {
		warningOnce(`table-filter:${type}`, false, `The ${type} filter type not found`);
		return null;
	}
	return adapt.adapter(filter);
};

export { hasFilterAdapter, addFilterAdapter, addFilterAdapterAsync, renderDataTableFilter };
