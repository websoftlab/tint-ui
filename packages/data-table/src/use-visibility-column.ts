"use client";

import type { DataTableDisplayCell } from "./types";
import type { VisibilityState, OnChangeFn } from "@tanstack/react-table";

import * as React from "react";
import { onStore } from "./utils";
import { isLocalStorage } from "@tint-ui/tools/browser-support";

const readState = function (
	name: string,
	storage: string | boolean,
	readStore: boolean,
	cells: DataTableDisplayCell[]
) {
	let initialData: Partial<VisibilityState> = {};
	if (readStore) {
		const data = onStore(name, storage, "visibility", (local, name) => {
			const text = local.getItem(name);
			return text && text.startsWith("{") ? JSON.parse(text) : null;
		});
		if (data != null) {
			initialData = data as VisibilityState;
		}
	}
	const data = {} as VisibilityState;
	cells.forEach((item) => {
		if (item.invisible) {
			return;
		}
		if (item.required) {
			data[item.name] = true;
		} else {
			const value = initialData[item.name];
			if (value != null) {
				data[item.name] = value;
			} else {
				data[item.name] = !item.hidden;
			}
		}
	});
	return data as VisibilityState;
};

const useVisibilityColumn = function (
	name: string,
	cells: DataTableDisplayCell[],
	options: { storage: string | boolean; ssr: boolean }
): [VisibilityState, OnChangeFn<VisibilityState>] {
	const { storage, ssr } = options;
	const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(() =>
		readState(name, storage, !ssr, cells)
	);

	const ref = React.useRef({
		name,
		storage,
		update(data: VisibilityState, fn?: (name: string) => void) {
			const { name, storage } = ref.current;
			onStore(name, storage, "visibility", (local, name) => {
				if (fn) {
					fn(name);
				}
				local.setItem(name, JSON.stringify(data));
			});
		},
	});

	ref.current.name = name;
	ref.current.storage = storage;

	React.useEffect(() => {
		let origin = columnVisibility;
		const data = readState(name, storage, true, cells);
		for (const key in data) {
			if (columnVisibility[key] !== data[key]) {
				origin = data;
				setColumnVisibility(origin);
				break;
			}
		}
		if (!storage || !isLocalStorage()) {
			return;
		}
		let storeKey = "";
		ref.current.update(origin, (name) => {
			storeKey = name;
		});
		if (storeKey.length) {
			const fn = (event: StorageEvent) => {
				if (event.key === storeKey && event.newValue != null) {
					const data = JSON.parse(event.newValue) as VisibilityState;
					setColumnVisibility(data);
					ref.current.update(data);
				}
			};
			window.addEventListener("storage", fn);
			return () => {
				window.removeEventListener("storage", fn);
			};
		}
	}, [name, storage, ssr, cells]);

	const columnVisibilityHandler: OnChangeFn<VisibilityState> = React.useCallback(
		(data: VisibilityState | ((value: VisibilityState) => VisibilityState)) => {
			setColumnVisibility((prevState) => {
				if (typeof data === "function") {
					data = data(prevState);
				}
				ref.current.update(data);
				return data;
			});
		},
		[setColumnVisibility]
	);

	return [columnVisibility, columnVisibilityHandler];
};

export { useVisibilityColumn };
