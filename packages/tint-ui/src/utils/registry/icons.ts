import type { RegistryIconSchema } from "./types";

export const icons: RegistryIconSchema[] = [
	{
		name: "loader",
		type: "outline",
		data: ["M12 3a9 9 0 1 0 9 9"],
	},
	{
		name: "x",
		type: "outline",
		data: ["M18 6l-12 12", "M6 6l12 12"],
	},
	{
		name: "search",
		type: "outline",
		data: ["M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0", "M21 21l-6 -6"],
	},
	{
		name: "check",
		type: "outline",
		data: ["M5 12l5 5l10 -10"],
	},
	{
		name: "selector",
		type: "outline",
		data: ["M8 9l4 -4l4 4", "M16 15l-4 4l-4 -4"],
	},
	{
		name: "sort-asc",
		type: "outline",
		data: ["M12 5l0 14", "M18 13l-6 6", "M6 13l6 6"],
	},
	{
		name: "sort-desc",
		type: "outline",
		data: ["M12 5l0 14", "M18 11l-6 -6", "M6 11l6 -6"],
	},
	{
		name: "eye",
		type: "outline",
		data: [
			"M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0",
			"M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6",
		],
	},
	{
		name: "eye-off",
		type: "outline",
		data: [
			"M10.585 10.587a2 2 0 0 0 2.829 2.828",
			"M16.681 16.673a8.717 8.717 0 0 1 -4.681 1.327c-3.6 0 -6.6 -2 -9 -6c1.272 -2.12 2.712 -3.678 4.32 -4.674m2.86 -1.146a9.055 9.055 0 0 1 1.82 -.18c3.6 0 6.6 2 9 6c-.666 1.11 -1.379 2.067 -2.138 2.87",
			"M3 3l18 18",
		],
	},
	{
		name: "user",
		type: "outline",
		data: ["M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0", "M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2"],
	},
	{
		name: "toast-info",
		type: "outline",
		data: ["M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0", "M12 9h.01", "M11 12h1v4h1"],
	},
	{
		name: "toast-success",
		type: "outline",
		data: [
			"M5 7.2a2.2 2.2 0 0 1 2.2 -2.2h1a2.2 2.2 0 0 0 1.55 -.64l.7 -.7a2.2 2.2 0 0 1 3.12 0l.7 .7c.412 .41 .97 .64 1.55 .64h1a2.2 2.2 0 0 1 2.2 2.2v1c0 .58 .23 1.138 .64 1.55l.7 .7a2.2 2.2 0 0 1 0 3.12l-.7 .7a2.2 2.2 0 0 0 -.64 1.55v1a2.2 2.2 0 0 1 -2.2 2.2h-1a2.2 2.2 0 0 0 -1.55 .64l-.7 .7a2.2 2.2 0 0 1 -3.12 0l-.7 -.7a2.2 2.2 0 0 0 -1.55 -.64h-1a2.2 2.2 0 0 1 -2.2 -2.2v-1a2.2 2.2 0 0 0 -.64 -1.55l-.7 -.7a2.2 2.2 0 0 1 0 -3.12l.7 -.7a2.2 2.2 0 0 0 .64 -1.55v-1",
			"M9 12l2 2l4 -4",
		],
	},
	{
		name: "toast-warning",
		type: "outline",
		data: [
			"M12 9v4",
			"M10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636 -2.87l-8.106 -13.536a1.914 1.914 0 0 0 -3.274 0z",
			"M12 16h.01",
		],
	},
	{
		name: "toast-error",
		type: "outline",
		data: [
			"M12 21a9 9 0 1 1 0 -18a9 9 0 0 1 0 18z",
			"M8 16l1 -1l1.5 1l1.5 -1l1.5 1l1.5 -1l1 1",
			"M8.5 11.5l1.5 -1.5l-1.5 -1.5",
			"M15.5 11.5l-1.5 -1.5l1.5 -1.5",
		],
	},
	{
		name: "chevron-left",
		type: "outline",
		data: ["M15 6l-6 6l6 6"],
	},
	{
		name: "chevron-right",
		type: "outline",
		data: ["M9 6l6 6l-6 6"],
	},
	{
		name: "circle",
		type: "outline",
		data: ["M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"],
	},
	{
		name: "dots",
		type: "outline",
		data: [
			"M5 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0",
			"M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0",
			"M19 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0",
		],
	},
	{
		name: "plus",
		type: "outline",
		data: ["M12 5l0 14", "M5 12l14 0"],
	},
	{
		name: "item-collapse",
		type: "outline",
		data: [
			"M4 18v-12a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z",
			"M4 9h16",
			"M10 16l2 -2l2 2",
		],
	},
	{
		name: "item-expand",
		type: "outline",
		data: [
			"M4 18v-12a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z",
			"M4 9h16",
			"M10 14l2 2l2 -2",
		],
	},
	{
		name: "arrow-down",
		type: "outline",
		data: ["M12 5l0 14", "M18 13l-6 6", "M6 13l6 6"],
	},
	{
		name: "data-table-row-menu",
		type: "outline",
		data: [
			"M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0",
			"M12 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0",
			"M12 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0",
		],
	},
	{
		name: "data-table-boolean-true",
		type: "outline",
		data: ["M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0", "M9 12l2 2l4 -4"],
	},
	{
		name: "data-table-boolean-false",
		type: "outline",
		data: ["M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0", "M9 12l6 0"],
	},
	{
		name: "data-table-boolean-null",
		type: "outline",
		data: [
			"M7.5 4.21l0 .01",
			"M4.21 7.5l0 .01",
			"M3 12l0 .01",
			"M4.21 16.5l0 .01",
			"M7.5 19.79l0 .01",
			"M12 21l0 .01",
			"M16.5 19.79l0 .01",
			"M19.79 16.5l0 .01",
			"M21 12l0 .01",
			"M19.79 7.5l0 .01",
			"M16.5 4.21l0 .01",
			"M12 3l0 .01",
		],
	},
	{
		name: "data-table-view",
		type: "outline",
		data: [
			"M14 6m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0",
			"M4 6l8 0",
			"M16 6l4 0",
			"M8 12m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0",
			"M4 12l2 0",
			"M10 12l10 0",
			"M17 18m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0",
			"M4 18l11 0",
			"M19 18l1 0",
		],
	},
	{
		name: "data-table-view-columns",
		type: "outline",
		data: ["M3 3m0 1a1 1 0 0 1 1 -1h16a1 1 0 0 1 1 1v16a1 1 0 0 1 -1 1h-16a1 1 0 0 1 -1 -1zm6 -1v18m6 -18v18"],
	},
	{
		name: "data-table-view-sorts",
		type: "outline",
		data: ["M7 3l0 18", "M10 6l-3 -3l-3 3", "M20 18l-3 3l-3 -3", "M17 21l0 -18"],
	},
	{
		name: "data-table-view-filters",
		type: "outline",
		data: [
			"M11.36 20.213l-2.36 .787v-8.5l-4.48 -4.928a2 2 0 0 1 -.52 -1.345v-2.227h16v2.172a2 2 0 0 1 -.586 1.414l-4.414 4.414",
			"M18 18m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0",
			"M20.2 20.2l1.8 1.8",
		],
	},
	{
		name: "data-table-add-filter",
		type: "outline",
		data: ["M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0", "M9 12h6", "M12 9v6"],
	},
	{
		name: "pagination-first",
		type: "outline",
		data: ["M11 7l-5 5l5 5", "M17 7l-5 5l5 5"],
	},
	{
		name: "pagination-last",
		type: "outline",
		data: ["M7 7l5 5l-5 5", "M13 7l5 5l-5 5"],
	},
	{
		name: "pagination-previous",
		type: "outline",
		data: ["M15 6l-6 6l6 6"],
	},
	{
		name: "pagination-next",
		type: "outline",
		data: ["M9 6l6 6l-6 6"],
	},
];
