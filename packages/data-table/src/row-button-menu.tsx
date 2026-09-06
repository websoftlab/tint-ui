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
import { useLayer } from "@tint-ui/theme";

const rowButtonMenu = <TData,>(info: CellContext<TData, unknown>, menu: RowMenuOption<TData>[]) => {
	const classes = useDataTableClasses();
	const { loading } = useDataTableContext<TData>();
	const rowHandler = useRowMenu(info);
	const layer = useLayer();
	return (
		<div className={classes.menuGroup} data-row-click="off">
			{menu.map((item) => {
				const { icon, label, id, destructive } = item;
				const { disabled, onClick, getLabel } = rowHandler(item);
				return (
					<TooltipText key={id} tooltip={getLabel(label)} asChild>
						<Button
							data-id={layer.dataId("table-nav", info.row.id, id)}
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
