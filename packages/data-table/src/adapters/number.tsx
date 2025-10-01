"use client";

import type { DataTableCellAdapter, DataTableCellAdapterOptions } from "../types";

import * as React from "react";
import { numberFormat } from "./number-format";
import { useDataTableClasses } from "../classes";

type TableDataCellNumberConfig = {
	prefix?: string;
	suffix?: string;
	format?: boolean;
	decimal?: number;
	decimalRequired?: boolean;
};

const NumberType = (props: { value: number | string } & TableDataCellNumberConfig) => {
	const { value, format, prefix, suffix, decimal = 2, decimalRequired = false } = props;
	const numberValue = typeof value === "number" ? value : parseFloat(String(value));
	const numberIsNaN = !Number.isFinite(numberValue);

	let node: string;
	if (numberIsNaN) {
		node = Number.isNaN(numberValue) ? "NaN" : "Infinite";
	} else {
		if (format) {
			node = numberFormat(numberValue, decimal, decimalRequired);
		} else {
			node = String(numberValue);
		}
		if (prefix) {
			node = prefix + node;
		}
		if (suffix) {
			node += suffix;
		}
	}
	const classes = useDataTableClasses();
	return <span className={classes.numberCellType + (numberIsNaN ? ` ${classes.isNaN}` : "")}>{node}</span>;
};

NumberType.displayName = "NumberType";

const numberAdapter: DataTableCellAdapter<TableDataCellNumberConfig> = (value, cell) => {
	return <NumberType value={value as number} {...cell.config} />;
};

const numberAdapterOptions: DataTableCellAdapterOptions<TableDataCellNumberConfig> = {
	nullable() {
		return "";
	},
	align: "end",
};

export { numberAdapter, numberAdapterOptions };
export type { TableDataCellNumberConfig };
