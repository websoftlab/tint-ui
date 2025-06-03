import type { ReactNode } from "react";

export const colors = [
	"#1E67BA",
	"#1E40BA",
	"#231EBA",
	"#451EBA",
	"#691EBA",
	"#931EBA",
	"#BA1EBA",
	"#BA1E93",
	"#BA1E69",
	"#BA1E40",
	"#BA1E2B",
	"#BB1D1D",
	"#BA401E",
	"#BA671E",
	"#BA8B1E",
	"#BAAD1E",
	"#A5BA1E",
	"#7EBA1E",
	"#5ABA1E",
	"#33BA1E",
	"#1EBA2D",
	"#1EBA55",
	"#1EBA7C",
	"#1EBA9D",
	"#1EB2BA",
	"#1E8BBA",
];

export function getColor(name: ReactNode) {
	if (!name || typeof name !== "string") {
		return colors[0];
	}
	const textName = String(name);
	const index = (textName.charCodeAt(0) + textName.charCodeAt(textName.length - 1) + textName.length) % colors.length;
	return colors[index];
}

export const getShortName = (name: string) => {
	name = String(name).trim();
	if (!name.length) {
		return "";
	}

	let short = name.substring(0, 1).toUpperCase();
	let index = 0;
	while (true) {
		index = name.indexOf(" ", index);
		if (index === -1 || ++index === name.length) {
			break;
		}
		const second = name.substring(index, index + 1);
		if (second !== " ") {
			short += second.toUpperCase();
			break;
		}
	}

	return short;
};
