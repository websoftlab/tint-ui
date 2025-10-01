"use client";

import type { Table } from "@tanstack/react-table";

import * as React from "react";
import { SvgThemeIcon } from "@tint-ui/svg-icon";
import { InputGroup, InputAddon, InputText } from "@tint-ui/input";
import { useDataTableFilterClasses } from "./filter-classes";
import { useDataTableContext } from "./context";
import clsx from "clsx";

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
		const {
			lexicon,
			table,
			toolbar: { size },
		} = useDataTableContext<TData>();

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
				<InputAddon size={size} variant="label">
					<SvgThemeIcon icon="search" />
				</InputAddon>
				<InputText
					{...inputProps}
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
