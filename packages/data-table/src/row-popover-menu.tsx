"use client";

import type { CellContext } from "@tanstack/react-table";
import type { RowMenuOption } from "./types";

import * as React from "react";
import { Button } from "@tint-ui/button";
import { SvgThemeIcon } from "@tint-ui/svg-icon";
import {
	DropdownMenu,
	DropdownMenuItem,
	DropdownMenuContent,
	DropdownMenuTrigger,
	DropdownMenuPortal,
} from "@tint-ui/dropdown-menu";
import { useRowMenu } from "./use-row-menu";
import { useDataTableContext } from "./context";
import { useDataTableClasses } from "./classes";

const rowPopoverMenu = <TData,>(info: CellContext<TData, unknown>, menu: RowMenuOption<TData>[]) => {
	const classes = useDataTableClasses();
	const { loading } = useDataTableContext<TData>();
	const rowMenu = useRowMenu(info);
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					disabled={loading}
					size="xs"
					iconOnly
					rounded
					iconRight={<SvgThemeIcon icon="data-table-row-menu" />}
				/>
			</DropdownMenuTrigger>
			<DropdownMenuPortal>
				<DropdownMenuContent>
					{menu.map((item: RowMenuOption<TData>) => {
						const { icon, label, id, destructive } = item;
						const { disabled, onClick } = rowMenu(item);
						return (
							<DropdownMenuItem
								key={id}
								className={destructive ? classes.menuItemDestructive : undefined}
								disabled={disabled}
								onSelect={onClick}
							>
								{icon != null && <SvgThemeIcon icon={icon} />}
								{label}
							</DropdownMenuItem>
						);
					})}
				</DropdownMenuContent>
			</DropdownMenuPortal>
		</DropdownMenu>
	);
};

export { rowPopoverMenu };
