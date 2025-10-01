"use client";

import type { CellContext } from "@tanstack/react-table";
import type { RowMenuOption } from "./types";

import * as React from "react";
import { Button } from "@tint-ui/button";
import { TooltipText } from "@tint-ui/tooltip";
import { SvgThemeIcon } from "@tint-ui/svg-icon";
import { useRowMenu } from "./use-row-menu";
import { useDataTableClasses } from "./classes";
import { useDataTableContext } from "./context";

const rowButtonMenu = <TData,>(info: CellContext<TData, unknown>, menu: RowMenuOption<TData>[]) => {
	const classes = useDataTableClasses();
	const { loading } = useDataTableContext<TData>();
	const rowHandler = useRowMenu(info);
	return (
		<div className={classes.menuGroup}>
			{menu.map((item) => {
				const { icon, label, id, destructive } = item;
				const { disabled, onClick } = rowHandler(item);
				return (
					<TooltipText key={id} tooltip={label} asChild>
						<Button
							disabled={disabled || loading}
							onClick={onClick}
							iconOnly
							size="xs"
							variant={destructive ? "destructive" : "outline"}
							iconLeft={<SvgThemeIcon icon={icon || "data-table-row-menu"} />}
						/>
					</TooltipText>
				);
			})}
		</div>
	);
};

export { rowButtonMenu };
