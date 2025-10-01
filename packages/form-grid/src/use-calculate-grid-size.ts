"use client";

import type {
	FormGridCol,
	FormGridGroupCol,
	FormGridSize,
	FormGridFieldOneOfDisplayType,
	FormGridGroupHeading,
} from "./types";

import * as React from "react";
import { resizeElement } from "@tint-ui/tools/resize-element";
import { isFullFieldType } from "./form-grid-field-item";
import { isArrayType, isObjectType } from "./type-of";

const sizes: Record<FormGridCol, number> = {
	"col-1": 100,
	"col-1-2": 50,
	"col-1-3": 33,
	"col-2-3": 66,
};

const getSize = (value: number): FormGridSize => {
	if (value <= 480) {
		return "sm";
	}
	if (value <= 768) {
		return "md";
	}
	return "lg";
};

const useCalculateGridSize = (ref: React.MutableRefObject<HTMLElement | null>): FormGridSize => {
	const [size, setSize] = React.useState<FormGridSize>("md");

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

	return size;
};

const calculateFieldsGroup = (
	size: FormGridSize,
	fields: FormGridFieldOneOfDisplayType[]
): (FormGridGroupHeading | FormGridGroupCol[])[] => {
	if (fields.length < 2 || size === "sm") {
		return fields.map((field) => [{ key: "n1", col: "col-1", field }]);
	}

	const group: (FormGridGroupHeading | FormGridGroupCol[])[] = [[]];
	const isMd = size === "md";
	let n = 0;
	let i = 0;
	let lastColEnd = false;

	for (const field of fields) {
		let col: FormGridCol;
		let colStart = false;
		let colEnd = false;

		if (isArrayType(field) || isObjectType(field)) {
			col = "col-1";
		} else {
			col = field.col || "col-1-2";
			if (field.colStart) {
				colStart = true;
			}
			if (field.colEnd) {
				colEnd = true;
			}
		}

		if (isFullFieldType(field)) {
			col = "col-1";
		} else if ((isMd && (col === "col-1-3" || col === "col-2-3")) || !sizes.hasOwnProperty(col)) {
			col = "col-1-2";
		}

		const current = group[i] as FormGridGroupCol[];
		const first = current.length === 0;
		if (first) {
			colStart = false;
		}

		if (field.heading != null) {
			let { heading } = field;
			if (typeof heading === "string") {
				heading = { heading };
			} else {
				heading = {
					heading: String(heading.heading),
					id: heading.id,
				};
			}
			if (first) {
				group[i] = heading;
			} else {
				group[++i] = heading;
			}
			n = 0;
			group[++i] = [];
		}

		const nItem = sizes[col];
		const item: FormGridGroupCol = {
			field,
			col,
		};

		n += lastColEnd ? 100 : nItem;
		if (n <= 100 && !colStart) {
			(group[i] as FormGridGroupCol[]).push(item);
		} else {
			n = nItem;
			group[++i] = [item];
		}

		lastColEnd = colEnd;
	}

	return group;
};

export { calculateFieldsGroup, useCalculateGridSize };
