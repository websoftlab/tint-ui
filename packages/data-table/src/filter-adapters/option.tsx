"use client";

import type { InputSelectOption } from "@tint-ui/tools";
import type { DataTableFilterAdapter, DataTableFilterOptionConfig, DataTableDisplayFilter } from "../types";

import * as React from "react";
import { SvgThemeIcon } from "@tint-ui/svg-icon";
import clsx from "clsx";
import { isEmptyString } from "@tint-ui/tools/is-empty";
import { Badge } from "@tint-ui/badge";
import { Button } from "@tint-ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
} from "@tint-ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@tint-ui/popover";
import { useOptionFilter } from "./use-option-filter";
import { useDataTableFilterClasses } from "../filter-classes";

type OptionGroup = {
	heading?: string | undefined;
	options: InputSelectOption[];
};

const createOptionGroups = (options: InputSelectOption[], groupBy: string) => {
	const root: InputSelectOption[] = [];
	const optionGroup: OptionGroup[] = [];
	const cache = new Map<string, InputSelectOption[]>();
	for (const option of options) {
		const { config } = option;
		if (config && groupBy in config && (config as { [key: string]: string })[groupBy]) {
			const heading = String((config as { [key: string]: string })[groupBy]).trim();
			let options = cache.get(heading);
			if (!options) {
				options = [];
				cache.set(heading, options);
				optionGroup.push({ heading, options });
			}
			options.push(option);
		} else {
			root.push(option);
		}
	}
	if (root.length) {
		optionGroup.push({ options: root });
	}
	return optionGroup;
};

const FilterOptionType = ({ filter }: { filter: DataTableDisplayFilter<string, DataTableFilterOptionConfig> }) => {
	const classes = useDataTableFilterClasses();
	const ctx = useOptionFilter(filter);
	const column = ctx.column;
	if (!column) {
		return null;
	}

	const {
		value,
		options,
		getSelectedOptions,
		manual,
		inputProps,
		lexicon,
		icon,
		groupBy = null,
		disableSearch = false,
	} = ctx;

	const selectedOptions = getSelectedOptions();
	const optionGroups = React.useMemo(
		() => (groupBy ? createOptionGroups(options, groupBy) : [{ options }]),
		[options, groupBy]
	);

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					size={ctx.size}
					className={classes.button}
					iconLeft={<SvgThemeIcon icon={icon || "data-table-add-filter"} />}
				>
					<span>{filter.label}</span>
					{selectedOptions.length > 0 && (
						<>
							<Badge variant="secondary" className={clsx(classes.badge, classes.mobile)}>
								{selectedOptions.length}
							</Badge>
							<div className={clsx(classes.badges, classes.desktop)}>
								{selectedOptions.length > 2 ? (
									<Badge variant="secondary" className={classes.badge}>
										{lexicon.filterSelected(selectedOptions.length)}
									</Badge>
								) : (
									selectedOptions.map((option) => (
										<Badge variant="secondary" key={option.value} className={classes.badge}>
											{option.label}
										</Badge>
									))
								)}
							</div>
						</>
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent className={classes.popover} align="start">
				<Command>
					{(manual || (options.length > 5 && !disableSearch)) && (
						<CommandInput
							placeholder={lexicon.filterSearch(filter.label)}
							{...(manual ? inputProps : null)}
						/>
					)}
					<CommandList>
						<CommandEmpty>{lexicon.filterNotFound}</CommandEmpty>
						{optionGroups.map(({ heading, options }, index) => (
							<CommandGroup key={index} heading={heading}>
								{options.map((option) => {
									const optionValue = option.value as string;
									const isSelected = value.includes(optionValue);
									const { icon } = (option.config || {}) as { icon?: string };
									return (
										<CommandItem
											key={option.value}
											onSelect={() => {
												const selectedValues = new Set(value);
												if (isSelected) {
													selectedValues.delete(optionValue);
												} else {
													if (!filter.multiple) {
														selectedValues.clear();
													}
													selectedValues.add(optionValue);
												}
												column.setFilterValue(Array.from(selectedValues));
											}}
										>
											<div className={clsx(classes.checkbox, isSelected && classes.selected)}>
												<SvgThemeIcon icon="check" aria-hidden="true" />
											</div>
											{!isEmptyString(icon) && (
												<SvgThemeIcon icon={icon} className={classes.icon} aria-hidden="true" />
											)}
											<span className={classes.label}>{option.label}</span>
										</CommandItem>
									);
								})}
							</CommandGroup>
						))}
						{value.length > 0 && (
							<CommandGroup forceMount>
								<CommandSeparator />
								<CommandItem
									onSelect={() => {
										column.setFilterValue(undefined);
									}}
								>
									{lexicon.filterClear}
								</CommandItem>
							</CommandGroup>
						)}
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
};

FilterOptionType.displayName = "FilterOptionType";

const optionFilterAdapter: DataTableFilterAdapter<string, DataTableFilterOptionConfig> = (filter) => {
	return <FilterOptionType filter={filter} />;
};

export { optionFilterAdapter };
