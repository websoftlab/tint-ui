"use client";

import type { Table } from "@tanstack/react-table";

import * as React from "react";
import clsx from "clsx";
import { SvgThemeIcon } from "@tint-ui/svg-icon";
import { InputGroup, InputAddon, InputText } from "@tint-ui/input";
import { useLayer } from "@tint-ui/theme";
import { useDataTableFilterClasses } from "./filter-classes";
import { useDataTableContext } from "./context";

const getFilterText = <TData,>(table: Table<TData>) => {
	const text = table.getState().globalFilter;
	return typeof text === "string" ? text : "";
};

const DataTableTextFilter = React.forwardRef(
	<TData,>(
		{
			className,
			isMobile = false,
			...props
		}: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & { isMobile?: boolean },
		ref: React.ForwardedRef<HTMLDivElement>
	) => {
		const classes = useDataTableFilterClasses();
		const layer = useLayer();
		const {
			lexicon,
			table,
			toolbar: { size },
		} = useDataTableContext<TData>();

		const forId = React.useId();
		const [text, setText] = React.useState(() => getFilterText(table));
		const focusRef = React.useRef(false);
		const { resetHandler, inputProps } = React.useMemo(() => {
			const resetHandler = () => {
				setText(getFilterText(table));
			};
			return {
				resetHandler,
				inputProps: {
					onFocus() {
						focusRef.current = true;
					},
					onBlur() {
						focusRef.current = false;
						resetHandler();
					},
				},
			};
		}, [table]);

		const filterText = getFilterText(table);
		React.useEffect(() => {
			if (filterText !== text && !focusRef.current) {
				resetHandler();
			}
		}, [filterText]);

		return (
			<InputGroup
				{...props}
				size={size}
				className={clsx(classes.text, isMobile && classes.textMobile, className)}
				ref={ref}
			>
				<InputAddon
					variant="label"
					size={size}
					data-id={layer.dataId("data-table", "filter-label")}
					htmlFor={forId}
				>
					<SvgThemeIcon icon="search" />
				</InputAddon>
				<InputText
					{...inputProps}
					id={forId}
					data-id={layer.dataId("data-table", "text-filter")}
					size={size}
					placeholder={lexicon.search}
					value={text}
					onChange={(event) => {
						const value = event.target.value;
						setText(value);
						table.setGlobalFilter(value);
					}}
				/>
			</InputGroup>
		);
	}
);

DataTableTextFilter.displayName = "DataTableTextFilter";

type DataTableTextFilterProps = React.ComponentProps<typeof DataTableTextFilter>;

export { DataTableTextFilter };
export type { DataTableTextFilterProps };
