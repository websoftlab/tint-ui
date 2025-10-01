"use client";

import * as React from "react";
import { Button } from "@tint-ui/button";
import {
	DropdownMenu,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuContent,
	DropdownMenuTrigger,
	DropdownMenuPortal,
} from "@tint-ui/dropdown-menu";
import { useDataTableContext } from "./context";
import { SvgThemeIcon } from "@tint-ui/svg-icon";

const PaginationSizeOptions = () => {
	const {
		loading,
		loadingTarget,
		navbar: { pageSize, pageSizeOptions, size, onPageSizeChange },
	} = useDataTableContext();
	if (pageSizeOptions.length < 2) {
		return null;
	}
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="outline"
					disabled={loading}
					loading={loading && loadingTarget === "page-size"}
					size={size}
					iconRight={<SvgThemeIcon icon="selector" />}
				>
					{pageSize}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuPortal>
				<DropdownMenuContent align="end">
					<DropdownMenuRadioGroup
						value={String(pageSize)}
						onValueChange={(value) => {
							onPageSizeChange(parseInt(value));
						}}
					>
						{pageSizeOptions.map((option) => (
							<DropdownMenuRadioItem key={option} value={String(option)}>
								{option}
							</DropdownMenuRadioItem>
						))}
					</DropdownMenuRadioGroup>
				</DropdownMenuContent>
			</DropdownMenuPortal>
		</DropdownMenu>
	);
};

export { PaginationSizeOptions };
