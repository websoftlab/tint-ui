"use client";

import type { Column } from "@tanstack/react-table";
import type { InputSelectOption } from "@tint-ui/tools";
import type {
	DataTableDisplayFilter,
	DataTableFilterOptionConfig,
	FilterOptionCallbackType,
	FilterOptionQueryMode,
} from "../types";

import * as React from "react";

import { useDataTableContext } from "../context";
import { errorMessage } from "@tint-ui/tools/error-message";
import { makeOption } from "@tint-ui/tools/make-option";

type FilterState = {
	options: InputSelectOption[];
	inputText: string;
	text: string;
	loading: boolean;
	error: string | null;
};

const getOptions = (result: InputSelectOption[], dump: Record<string, InputSelectOption>) => {
	const options: InputSelectOption[] = [];
	if (result.length) {
		result.forEach((option) => {
			const item = makeOption(option, dump);
			if (item) {
				options.push(item);
			}
		});
	}
	return options;
};

const useOptionFilter = function <TData>(filter: DataTableDisplayFilter<keyof TData, DataTableFilterOptionConfig>) {
	const { name, config: { options: filterOptions, initialOptions, ...rest } = {} } = filter;
	const ctx = useDataTableContext();
	const column = ctx.table.getColumn(name) as Column<TData> | undefined;

	const refFn = React.useRef<null | FilterOptionCallbackType>(null);
	refFn.current = typeof filterOptions === "function" ? filterOptions : null;

	const refDump = React.useRef<Record<string, InputSelectOption>>({});

	const filterValue = column ? (column.getFilterValue() as undefined | string | string[]) : null;
	const value = filterValue == null ? [] : Array.isArray(filterValue) ? filterValue : [filterValue];
	const refValue = React.useRef(value);
	refValue.current = value;

	const [state, setState] = React.useState<FilterState>(() => ({
		options: Array.isArray(filterOptions)
			? getOptions(filterOptions, refDump.current)
			: Array.isArray(initialOptions)
			? getOptions(initialOptions, refDump.current)
			: [],
		inputText: "",
		text: "",
		loading: false,
		error: null,
	}));

	const refState = React.useRef(state);
	refState.current = state;

	const { onMount, inputProps, getSelectedOptions } = React.useMemo(() => {
		let localState = state;
		let lazyId: number | null = null;
		let mount = false;
		let abortController: AbortController | null = null;

		const update = (newState: Partial<FilterState>) => {
			if (!mount) {
				return;
			}
			localState = {
				...localState,
				...newState,
			};
			setState(localState);
		};

		const lazyClear = () => {
			if (lazyId != null) {
				window.clearTimeout(lazyId);
				lazyId = null;
			}
		};

		const abort = () => {
			if (abortController != null) {
				abortController.abort();
				abortController = null;
			}
		};

		const query = (force = false, mode: FilterOptionQueryMode = "search") => {
			if (!mount) {
				return;
			}

			const callback = refFn.current;
			const text = localState.inputText.trim();
			if (callback == null) {
				return update({ loading: false, error: null, text });
			}
			if (!force && localState.text === text) {
				return;
			}

			abort();
			update({ loading: true, error: null, text });

			abortController = new AbortController();
			const signal = abortController.signal;
			(async (...args: [string, string[], FilterOptionQueryMode, AbortController]) => callback(...args))(
				localState.text,
				refValue.current,
				mode,
				abortController
			)
				.then((result) => {
					const options: InputSelectOption[] = [];
					const resultDump: Record<string, InputSelectOption> = {};
					result.forEach((option) => {
						const item = makeOption(option, resultDump);
						if (item) {
							options.push(item);
						}
					});

					Object.assign(refDump.current, resultDump);
					update({
						options,
						loading: false,
					});
				})
				.catch((error) => {
					if (signal.aborted) {
						return;
					}
					update({
						loading: false,
						error: errorMessage(error).message,
					});
				})
				.finally(() => {
					abortController = null;
				});
		};

		const lazyLoad = () => {
			if (refFn.current) {
				return;
			}
			lazyClear();
			lazyId = window.setTimeout(() => {
				lazyId = null;
				query();
			}, 250);
		};

		return {
			onMount() {
				mount = true;
				if (refValue.current.length) {
					query(true, "initial");
				}
				return () => {
					mount = false;
					lazyClear();
					abort();
				};
			},
			getSelectedOptions() {
				const options: InputSelectOption[] = [];
				refValue.current.forEach((name) => {
					const option = refDump.current[name];
					if (option) {
						options.push(option);
					}
				});
				return options;
			},
			inputProps: {
				get value() {
					return localState.inputText;
				},
				onValueChange(inputText: string) {
					update({ inputText });
					lazyLoad();
				},
				onFocus() {
					query(true);
				},
			},
		};
	}, []);

	React.useEffect(onMount, [onMount]);

	return {
		...rest,
		name,
		column,
		inputProps,
		getSelectedOptions,
		lexicon: ctx.lexicon,
		size: ctx.toolbar.size,
		manual: refFn.current != null,
		value: refValue.current,
		options: state.options,
		inputText: state.inputText,
		error: state.error,
		loading: state.loading,
	};
};

export { useOptionFilter };
