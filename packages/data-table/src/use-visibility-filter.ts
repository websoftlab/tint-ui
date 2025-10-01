import type { DataTableDisplayFilter, FilterVisibility } from "./types";

import * as React from "react";
import { onStore } from "./utils";
import { isLocalStorage } from "@tint-ui/tools/browser-support";

type FilteringState = {
	filterText: boolean;
	filters: {
		[key: string]: boolean | undefined;
	};
};

const readState = function <TData extends object>(
	name: string,
	storage: string | boolean,
	readStore: boolean,
	filters: DataTableDisplayFilter<keyof TData>[],
	filterText: boolean,
	requiredFilterText: boolean
) {
	const data: FilteringState = { filterText, filters: {} };
	filters.forEach((filter) => {
		data.filters[filter.name] = filter.required || !filter.hidden;
	});

	if (readStore) {
		const localData = onStore(name, storage, "filtering", (local, name) => {
			const text = local.getItem(name);
			return text && text.startsWith("{") ? (JSON.parse(text) as FilteringState) : null;
		});
		if (localData != null) {
			data.filterText = filterText && localData.filterText;
			const latest = localData.filters || {};
			filters.forEach(({ required, name }) => {
				const value = latest[name];
				if (!required && typeof value === "boolean") {
					data.filters[name] = value;
				}
			});
		}
	}

	if (filterText && requiredFilterText) {
		data.filterText = true;
	}

	return data;
};

const useVisibilityFilter = function <TData extends object>(
	name: string,
	filters: DataTableDisplayFilter<keyof TData>[],
	filterText: boolean,
	options: { storage: boolean | string; ssr: boolean; requiredFilterText?: boolean }
): FilterVisibility<TData> {
	const { storage, ssr, requiredFilterText = false } = options;
	const [filteringState, setFilteringState] = React.useState<FilteringState>(() =>
		readState<TData>(name, storage, !ssr, filters, filterText, requiredFilterText)
	);

	const ref = React.useRef(filteringState);
	ref.current = filteringState;

	const refUpdate = React.useRef((data: FilteringState, fn?: (name: string) => void) => {
		onStore(name, storage, "filtering", (local, name) => {
			if (fn) {
				fn(name);
			}
			local.setItem(name, JSON.stringify(data));
		});
	});

	React.useEffect(() => {
		const data = readState(name, storage, true, filters, filterText, requiredFilterText);
		const compare = () => {
			for (const name in data.filters) {
				if (data.filters[name] !== filteringState.filters[name]) {
					return false;
				}
			}
			return true;
		};
		if (filteringState.filterText !== data.filterText || !compare()) {
			setFilteringState(data);
		}
		if (!storage || !isLocalStorage()) {
			return;
		}
		let storeKey = "";
		refUpdate.current(data, (name) => {
			storeKey = name;
		});
		if (storeKey.length) {
			const fn = (event: StorageEvent) => {
				if (event.key === storeKey && event.newValue != null) {
					const data = JSON.parse(event.newValue) as FilteringState;
					setFilteringState(data);
					refUpdate.current(data);
				}
			};
			window.addEventListener("storage", fn);
			return () => {
				window.removeEventListener("storage", fn);
			};
		}
	}, [name, storage, ssr]);

	const { getFilters, getVisibleFilters, hasFilterVisible, onFilterVisibleChange, onFilterTextVisibleChange } =
		React.useMemo(() => {
			return {
				getFilters() {
					return filters;
				},
				getVisibleFilters() {
					return filters.filter((item) => ref.current.filters[item.name] === true);
				},
				hasFilterVisible(name: string) {
					return ref.current.filters[name] === true;
				},
				onFilterVisibleChange: (name: string, visible: boolean) => {
					const filter = filters.find((item) => item.name === name);
					if (!filter || filter.required || ref.current.filters[name] === visible) {
						return;
					}
					setFilteringState((prev) => {
						const state = {
							filterText: prev.filterText,
							filters: { ...prev.filters, [name]: visible },
						};
						refUpdate.current(state);
						return state;
					});
				},
				onFilterTextVisibleChange: (visible: boolean) => {
					if (!filterText || requiredFilterText || ref.current.filterText === visible) {
						return;
					}
					setFilteringState((prev) => {
						const state = {
							filterText: !prev.filterText,
							filters: prev.filters,
						};
						refUpdate.current(state);
						return state;
					});
				},
			};
		}, [filters, filterText, requiredFilterText]);

	return {
		filterText: filteringState.filterText,
		getVisibleFilters,
		getFilters,
		hasFilterVisible,
		onFilterVisibleChange,
		onFilterTextVisibleChange,
	};
};

export { useVisibilityFilter };
