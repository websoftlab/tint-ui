"use client";

import * as React from "react";
import { useApp } from "@tint-ui/app";
import { DataTableLexicon, LexiconType } from "./types";

const defaultLexicon: { [key in keyof Omit<DataTableLexicon, "filterSearch">]: string } = {
	filterClear: "Clear filter",
	filterSelected: "{{ selected }} selected",
	filterNotFound: "Filter options not found",
	filterReset: "Reset filter",
	view: "View",
	viewOptions: "Options",
	viewColumn: "Toggle columns",
	viewSortBy: "Sort By",
	viewFilter: "Filters",
	viewFilterText: "Search...",
	pageFirst: "Go to first page",
	pageLast: "Go to last page",
	pagePrevious: "Go to previous page",
	pageNext: "Go to next page",
	pageOf: "{{ pageNumber }} page of {{ pageCount }}",
	search: "Search...",
	notFound: "Empty data",
	notFoundFiltered: "Records not found",
	title: "{{ size }} row(s) out of {{ total }}",
	onePageTitle: "{{ size }} row(s)",
	selected: "{{ selected }} of {{ size }} row(s) selected",
};

type PlainKey =
	| "search"
	| "notFound"
	| "notFoundFiltered"
	| "filterClear"
	| "filterReset"
	| "filterNotFound"
	| "view"
	| "viewOptions"
	| "viewFilterText"
	| "viewFilter"
	| "viewSortBy"
	| "viewColumn"
	| "pageFirst"
	| "pageLast"
	| "pagePrevious"
	| "pageNext";

const plainKeyList: PlainKey[] = [
	"search",
	"notFound",
	"notFoundFiltered",
	"filterClear",
	"filterReset",
	"filterNotFound",
	"view",
	"viewOptions",
	"viewFilterText",
	"viewFilter",
	"viewSortBy",
	"viewColumn",
	"pageFirst",
	"pageLast",
	"pagePrevious",
	"pageNext",
];

type LexiconReplacementProps = {
	selected: number;
	size: number;
	total: number;
	limit: number;
	offset: number;
	pageNumber: number;
	pageCount: number;
};

const useLexicon = (customLexicon: Partial<DataTableLexicon>, replacement: LexiconReplacementProps) => {
	const app = useApp();
	const ref = React.useRef(customLexicon);
	const refReplacement = React.useRef(replacement);

	ref.current = customLexicon;
	refReplacement.current = replacement;

	const lexicon: LexiconType = React.useMemo(() => {
		const defaultText = (key: keyof Omit<DataTableLexicon, "filterSearch">) => {
			const line = app.line(`dataTable.${key}`);
			if (typeof line === "string") {
				return line;
			}
			return defaultLexicon[key];
		};
		const plain = (key: PlainKey) => {
			const value = ref.current[key];
			if (!value) {
				return defaultText(key);
			}
			return typeof value === "function" ? value() : value;
		};
		const createPlainFn = (key: PlainKey) => () => {
			return plain(key);
		};
		const replaceFn = <T>(key: keyof Omit<DataTableLexicon, "filterSearch">, replacement: T) => {
			const value = (ref.current[key] as string | ((data: T) => string) | undefined) || defaultText(key);
			return typeof value === "function" ? value(replacement) : app.replace(value, replacement);
		};
		const lexicon = {
			filterSearch(label: string): string {
				const value = ref.current.filterSearch;
				if (!value) {
					const line = app.line(`dataTable.filterSearch`);
					if (typeof line === "string") {
						return app.replace(line, { label });
					}
					return label;
				}
				return typeof value === "function" ? value({ label }) : value;
			},
			filterSelected(selected: number) {
				return replaceFn("filterSelected", { selected });
			},
			get pageOf() {
				const { pageNumber, pageCount } = refReplacement.current;
				return replaceFn("pageOf", { pageNumber, pageCount });
			},
			get selected() {
				const { size, selected } = refReplacement.current;
				return replaceFn("selected", { size, selected });
			},
			get onePageTitle() {
				const { size } = refReplacement.current;
				return replaceFn("onePageTitle", { size });
			},
			get title() {
				const curr = ref.current;
				const { size, offset, pageCount, pageNumber, total, limit } = refReplacement.current;
				if (size === total) {
					let value = curr.onePageTitle;
					if (!value && !curr.title) {
						value = defaultText("onePageTitle");
					}
					if (value) {
						const replacement = { size };
						return typeof value === "function" ? value(replacement) : app.replace(value, replacement);
					}
				}
				const replacement = { size, offset, total, limit, pageCount, pageNumber };
				const value = curr.title || defaultText("title");
				return typeof value === "function" ? value(replacement) : app.replace(value, replacement);
			},
		} as LexiconType;

		// define plain getters
		plainKeyList.forEach((key) => {
			Object.defineProperty(lexicon, key, { get: createPlainFn(key) });
		});

		return lexicon;
	}, [app]);

	return lexicon;
};

export { useLexicon };
