"use client";

import type { FormGridCol, FormGridFieldType } from "./types";

import * as React from "react";
import { resizeElement } from "@tint-ui/tools/resize-element";
import { isFullFieldType } from "./form-grid-field-item";

const sizes: Record<FormGridCol, number> = {
	"col-1": 100,
	"col-1-2": 50,
	"col-1-3": 33,
	"col-2-3": 66,
};

const sizeKeys: Record<FormGridCol, "n1" | "n1x2" | "n1x3" | "n2x3"> = {
	"col-1": "n1",
	"col-1-2": "n1x2",
	"col-1-3": "n1x3",
	"col-2-3": "n2x3",
};

type FormGroup = {
	key: "n1" | "n1x2" | "n1x3" | "n2x3";
	col: FormGridCol;
	field: FormGridFieldType;
};

const getSize = (value: number) => {
	if (value <= 480) {
		return "sm";
	}
	if (value <= 768) {
		return "md";
	}
	return "lg";
};

const useCalculate = (ref: React.MutableRefObject<HTMLElement | null>, fields: FormGridFieldType[]): FormGroup[][] => {
	const [size, setSize] = React.useState<"sm" | "md" | "lg">("md");

	React.useEffect(() => {
		if (ref.current) {
			let lastSize = "md";
			return resizeElement(
				ref.current,
				({ width }) => {
					const calc = getSize(width);
					if (lastSize !== calc) {
						lastSize = calc;
						setSize(calc);
					}
				},
				{ initialEmit: true }
			);
		}
	}, []);

	if (fields.length < 2 || size === "sm") {
		return fields.map((field) => [{ key: "n1", col: "col-1", field }]);
	}

	const group: FormGroup[][] = [[]];
	const isMd = size === "md";
	let n = 0;
	let i = 0;
	let l: FormGridFieldType | null = null;

	for (const field of fields) {
		let { col = "col-1-2" } = field;
		if (isFullFieldType(field)) {
			col = "col-1";
		} else if ((isMd && (col === "col-1-3" || col === "col-2-3")) || !sizes.hasOwnProperty(col)) {
			col = "col-1-2";
		}
		const nItem = sizes[col];
		const item: FormGroup = {
			field,
			col,
			key: sizeKeys[col],
		};
		n += (l != null && l.colEnd) || field.colStart ? 100 : nItem;
		if (n <= 100) {
			group[i].push(item);
		} else {
			n = nItem;
			group[++i] = [item];
		}
		l = field;
	}

	return group;
};

export { useCalculate };
