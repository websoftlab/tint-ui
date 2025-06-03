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
		data: ["M12 5l0 14", "M18 11l-6 -6", "M6 11l6 -6"],
	},
	{
		name: "sort-desc",
		type: "outline",
		data: ["M12 5l0 14", "M18 13l-6 6", "M6 13l6 6"],
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
];
