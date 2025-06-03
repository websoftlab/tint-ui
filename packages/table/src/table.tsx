"use client";

import type { HTMLAttributes, ComponentProps } from "react";

import * as React from "react";
import clsx from "clsx";
import { SvgThemeIcon } from "@tint-ui/svg-icon";
import { useProps } from "@tint-ui/theme";
import { useTableClasses } from "./classes";

const Table = React.forwardRef<
	HTMLTableElement,
	HTMLAttributes<HTMLTableElement> & { wrapperProps?: HTMLAttributes<HTMLDivElement> }
>(({ wrapperProps, children, ...props }, ref) => {
	const classes = useTableClasses();
	const { className: wrapperClassName, ...rest } = useProps(
		"component.table.wrapper",
		{ ...wrapperProps },
		{ as: "div" }
	);
	const { className, ...tableProps } = useProps("component.table", props, { as: "table" });
	return (
		<div className={clsx(classes.wrapper, wrapperClassName)} {...rest}>
			<table {...tableProps} className={clsx(classes.table, className)} ref={ref}>
				{children}
			</table>
		</div>
	);
});

const TableHeader = React.forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
	({ children, ...props }, ref) => {
		const { className, ...rest } = useProps("component.table.header", props, { as: "thead" });
		const classes = useTableClasses();
		return (
			<thead {...rest} className={clsx(classes.header, className)} ref={ref}>
				{children}
			</thead>
		);
	}
);

const TableBody = React.forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
	({ children, ...props }, ref) => {
		const { className, ...rest } = useProps("component.table.body", props, { as: "tbody" });
		const classes = useTableClasses();
		return (
			<tbody {...rest} className={clsx(classes.body, className)} ref={ref}>
				{children}
			</tbody>
		);
	}
);

const TableFooter = React.forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
	({ children, ...props }, ref) => {
		const { className, ...rest } = useProps("component.table.footer", props, { as: "tfoot" });
		const classes = useTableClasses();
		return (
			<tfoot {...rest} className={clsx(classes.footer, className)} ref={ref}>
				{children}
			</tfoot>
		);
	}
);

const TableRow = React.forwardRef<HTMLTableRowElement, HTMLAttributes<HTMLTableRowElement>>(
	({ children, ...props }, ref) => {
		const { className, ...rest } = useProps("component.table.row", props, { as: "tr" });
		const classes = useTableClasses();
		return (
			<tr {...rest} className={clsx(classes.row, className)} ref={ref}>
				{children}
			</tr>
		);
	}
);

const TableHead = React.forwardRef<
	HTMLTableCellElement,
	React.ThHTMLAttributes<HTMLTableCellElement> & {
		align?: "start" | "center" | "end";
	}
>(({ children, ...props }, ref) => {
	const { className, align = "start", ...rest } = useProps("component.table.head", props, { as: "th" });
	const classes = useTableClasses();
	return (
		<th {...rest} className={clsx(classes.head, className)} ref={ref}>
			<div data-align={align}>{children}</div>
		</th>
	);
});

const TableCell = React.forwardRef<
	HTMLTableCellElement,
	React.TdHTMLAttributes<HTMLTableCellElement> & {
		align?: "start" | "center" | "end";
	}
>(({ children, ...props }, ref) => {
	const { className, align = "start", ...rest } = useProps("component.table.cell", props, { as: "td" });
	const classes = useTableClasses();
	return (
		<td {...rest} data-align={align} className={clsx(classes.cell, className)} ref={ref}>
			{children}
		</td>
	);
});

const TableCaption = React.forwardRef<HTMLTableCaptionElement, HTMLAttributes<HTMLTableCaptionElement>>(
	({ children, ...props }, ref) => {
		const { className, ...rest } = useProps("component.table.caption", props, { as: "caption" });
		const classes = useTableClasses();
		return (
			<caption {...rest} className={clsx(classes.caption, className)} ref={ref}>
				{children}
			</caption>
		);
	}
);

const TableButtonSort = React.forwardRef<
	HTMLButtonElement,
	HTMLAttributes<HTMLButtonElement> & {
		direction?: "asc" | "ascending" | "desc" | "descending" | "none" | null;
	}
>(({ children, ...props }, ref) => {
	const { className, direction, ...rest } = useProps("component.table.sort", props, { as: "button" });
	const classes = useTableClasses();
	const isNone = direction == null || direction === "none";
	const isDesc = !isNone && (direction === "asc" || direction === "ascending");
	return (
		<button
			className={clsx(classes.sort, className)}
			type="button"
			aria-sort={isNone ? "none" : isDesc ? "descending" : "ascending"}
			{...rest}
			ref={ref}
		>
			{children}
			<SvgThemeIcon icon={isNone ? "selector" : isDesc ? "sort-desc" : "sort-asc"} />
		</button>
	);
});

Table.displayName = "Table";
TableHeader.displayName = "TableHeader";
TableBody.displayName = "TableBody";
TableFooter.displayName = "TableFooter";
TableRow.displayName = "TableRow";
TableHead.displayName = "TableHead";
TableCell.displayName = "TableCell";
TableCaption.displayName = "TableCaption";
TableButtonSort.displayName = "TableButtonSort";

type TableProps = ComponentProps<typeof Table>;
type TableHeaderProps = ComponentProps<typeof TableHeader>;
type TableBodyProps = ComponentProps<typeof TableBody>;
type TableFooterProps = ComponentProps<typeof TableFooter>;
type TableHeadProps = ComponentProps<typeof TableHead>;
type TableRowProps = ComponentProps<typeof TableRow>;
type TableCellProps = ComponentProps<typeof TableCell>;
type TableCaptionProps = ComponentProps<typeof TableCaption>;
type TableButtonSortProps = ComponentProps<typeof TableButtonSort>;

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption, TableButtonSort };

export type {
	TableProps,
	TableHeaderProps,
	TableBodyProps,
	TableFooterProps,
	TableHeadProps,
	TableRowProps,
	TableCellProps,
	TableCaptionProps,
	TableButtonSortProps,
};
