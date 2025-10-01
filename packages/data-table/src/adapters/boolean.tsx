"use client";

import type { DataTableCellAdapter, DataTableCellAdapterOptions } from "../types";

import * as React from "react";
import { SvgThemeIcon } from "@tint-ui/svg-icon";
import { useDataTableClasses } from "../classes";

type TableDataCellBooleanConfig = {
	iconTrue?: string;
	iconFalse?: string;
	iconNull?: string;
};

const typeIcon: Record<"iconTrue" | "iconFalse" | "iconNull", string> = {
	iconTrue: "data-table-boolean-true",
	iconFalse: "data-table-boolean-false",
	iconNull: "data-table-boolean-null",
};

const BooleanType = (props: { value?: boolean | null } & TableDataCellBooleanConfig) => {
	const { value } = props;
	const variant = value == null ? "iconNull" : value ? "iconTrue" : "iconFalse";
	const classes = useDataTableClasses();
	return (
		<span className={classes.booleanCellType}>
			<SvgThemeIcon className={classes[variant]} icon={props[variant] || typeIcon[variant]} />
		</span>
	);
};

BooleanType.displayName = "BooleanType";

const booleanAdapter: DataTableCellAdapter<TableDataCellBooleanConfig> = (value, cell) => {
	return <BooleanType value={value as boolean} {...cell.config} />;
};

const booleanAdapterOptions: DataTableCellAdapterOptions<TableDataCellBooleanConfig> = {
	nullable(cell) {
		const config = cell.config || {};
		return <BooleanType {...config} />;
	},
	align: "center",
};

export { booleanAdapter, booleanAdapterOptions };
export type { TableDataCellBooleanConfig };
