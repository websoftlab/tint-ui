import * as React from "react";
import clsx from "clsx";
import { flexRender } from "@tanstack/react-table";
import { Table, TableHeader, TableFooter, TableBody, TableRow, TableCell } from "@tint-ui/table";
import { isEmpty } from "@tint-ui/tools/is-empty";
import { useLayer } from "@tint-ui/theme";
import { useDataTableContext } from "./context";
import { DataTableCell, DataTableHead } from "./cell-adapter-type";
import { useDataTableClasses } from "./classes";

type DataTableContentNoRef = React.HTMLAttributes<HTMLTableElement> & {
	wrapperProps?: React.HTMLAttributes<HTMLDivElement>;
	themePropsType?: string;
	compact?: boolean;
};

const DataTableContent = React.forwardRef(
	<TData,>(
		{ themePropsType, className, wrapperProps = {}, ...props }: DataTableContentNoRef,
		ref: React.ForwardedRef<HTMLTableElement>
	) => {
		const context = useDataTableContext<TData>();
		const classes = useDataTableClasses();
		const {
			table,
			header: { top, bottom },
			invisible,
		} = context;

		const rows = table.getRowModel().rows;
		const widthArea = {
			top: top,
			bottom: bottom && !top,
			cell: !top && !bottom,
		};

		let notFound = "";
		if (rows.length === 0) {
			const { lexicon } = context;
			const state = table.getState();
			if (isEmpty(state.globalFilter) && state.columnFilters.length === 0 && state.pagination.pageIndex === 0) {
				notFound = lexicon.notFound;
			} else {
				notFound = lexicon.notFoundFiltered;
			}
		}

		const layer = useLayer();

		return (
			<Table
				data-id={layer.dataId("data-table")}
				{...props}
				wrapperProps={{
					...wrapperProps,
					className: clsx(wrapperProps.className, classes.dataTable),
				}}
				className={clsx(className, classes.table)}
				themePropsType={themePropsType}
				ref={ref}
			>
				{top && (
					<TableHeader data-id={layer.dataId("data-table-header")} themePropsType={themePropsType}>
						{table.getHeaderGroups().map((group) => (
							<TableRow
								data-id={layer.dataId("row-header")}
								key={group.id}
								themePropsType={themePropsType}
							>
								{group.headers.map((header) =>
									invisible[header.column.id] ? null : (
										<DataTableHead
											key={header.id}
											header={header}
											themePropsType={themePropsType}
											withWidth={widthArea.top}
										/>
									)
								)}
							</TableRow>
						))}
					</TableHeader>
				)}
				<TableBody data-id={layer.dataId("data-table-body")} themePropsType={themePropsType}>
					{rows.length === 0 ? (
						<TableRow key="empty" data-id={layer.dataId("row-empty")} themePropsType={themePropsType}>
							<TableCell
								data-id={layer.dataId("cell-empty")}
								colSpan={
									table.getVisibleLeafColumns().filter((cell) => invisible[cell.id] !== true).length
								}
								className={classes.cellNotFound}
							>
								{notFound}
							</TableCell>
						</TableRow>
					) : (
						rows.map((row, index) => {
							const clickHandler = context.getRowClickHandler(row.original);
							return (
								<TableRow
									key={row.id}
									data-id={layer.dataId("row", index)}
									themePropsType={themePropsType}
									onClick={clickHandler}
									data-click={clickHandler != null}
								>
									{row.getVisibleCells().map((cell) => {
										return invisible[cell.column.id] ? null : (
											<DataTableCell
												key={cell.id}
												cell={cell}
												themePropsType={themePropsType}
												withWidth={widthArea.cell && index === 0}
											>
												{flexRender(cell.column.columnDef.cell, cell.getContext())}
											</DataTableCell>
										);
									})}
								</TableRow>
							);
						})
					)}
				</TableBody>
				{bottom && (
					<TableFooter data-id={layer.dataId("data-table-footer")} themePropsType={themePropsType}>
						{table.getHeaderGroups().map((group) => (
							<TableRow
								data-id={layer.dataId("row-footer")}
								key={group.id}
								themePropsType={themePropsType}
							>
								{group.headers.map((header) =>
									invisible[header.column.id] ? null : (
										<DataTableHead
											key={header.id}
											header={header}
											themePropsType={themePropsType}
											withWidth={widthArea.bottom}
										/>
									)
								)}
							</TableRow>
						))}
					</TableFooter>
				)}
			</Table>
		);
	}
);

DataTableContent.displayName = "DataTableContent";

type DataTableContentProps = React.ComponentProps<typeof DataTableContent>;

export { DataTableContent };
export type { DataTableContentProps };
