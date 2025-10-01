import type { NavbarConfig, ToolbarConfig } from "./types";
import type { ColumnFilter } from "@tanstack/react-table";

import { isLocalStorage } from "@tint-ui/tools/browser-support";

const onStore = <T = unknown>(
	name: string,
	storage: string | boolean,
	type: string,
	fn: (storage: Storage, name: string) => T
): T | null => {
	if (!storage || !isLocalStorage()) {
		return null;
	}
	let key = `table:${name}:${type}`;
	if (typeof storage === "string") {
		key += `-${storage}`;
	}
	try {
		return fn(window.localStorage, key);
	} catch (err) {
		console.error("Window storage failure", err);
	}
	return null;
};

const defaultSize = "md";

const getToolbarConfig = (
	config: null | undefined | Partial<Omit<ToolbarConfig, "onFilterReset">>
): Omit<ToolbarConfig, "onFilterReset"> => {
	const { size = defaultSize, viewIconOnly = false, resetIconOnly = false } = config || {};
	return {
		size,
		viewIconOnly,
		resetIconOnly,
	};
};

const getNavbarConfig = (
	config: null | undefined | Partial<Omit<NavbarConfig, "onPageSizeChange">>,
	defaultPageSize: number
): Omit<NavbarConfig, "onPageSizeChange"> => {
	const {
		size = defaultSize,
		numberSize = 2,
		pageSize = defaultPageSize,
		pageSizeOptions,
		mode = "arrow",
	} = config || {};
	return {
		size,
		mode,
		pageSize,
		numberSize,
		pageSizeOptions: Array.isArray(pageSizeOptions) && pageSizeOptions.length > 0 ? pageSizeOptions : [pageSize],
	};
};

const getPaginationNumber = (pageNumber: number, pageCount: number, left: number) => {
	if (pageCount < 2) {
		return [];
	}

	const items: ({ divider: true } | { divider: false; page: number; selected: boolean })[] = [];
	const dots = left * 2 + 1 < pageCount;
	const push = (pg: number) => {
		if (pg === 0) {
			items.push({
				divider: true,
			});
		} else {
			items.push({
				divider: false,
				page: pg,
				selected: pg === pageNumber,
			});
		}
	};

	let start = pageNumber - left;
	let end = pageNumber + left;

	if (start < 1) {
		start = 1;
		end = left * 2 + 1;
	}

	if (end > pageCount) {
		end = pageCount;
		start = end - left * 2;
		if (start < 1) {
			start = 1;
		}
	}

	if (start > 1) {
		push(1);
		dots && start > 2 && push(0);
	}

	for (let i = start; i <= end; i++) {
		push(i);
	}

	if (end < pageCount) {
		dots && end + 1 < pageCount && push(0);
		push(pageCount);
	}

	return items;
};

const diffCompare = (a: unknown, b: unknown) => {
	if (Array.isArray(a)) {
		a = a.join(",");
	}
	if (Array.isArray(b)) {
		b = b.join(",");
	}
	return a === b;
};

const diffFilterId = (left: ColumnFilter[], right: ColumnFilter[]) => {
	const rightData: Record<string, unknown> = {};
	for (const { id, value } of right) {
		rightData[id] = value;
	}
	const leftData: Record<string, unknown> = {};
	for (const { id, value } of left) {
		if (leftData[id] == null) {
			return id;
		}
		leftData[id] = value;
	}
	for (const { id, value } of right) {
		if (leftData[id] == null || !diffCompare(leftData[id], value)) {
			return id;
		}
	}
	return "*";
};

export { onStore, getToolbarConfig, getNavbarConfig, getPaginationNumber, diffFilterId };
