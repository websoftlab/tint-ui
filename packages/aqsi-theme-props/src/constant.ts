import { attributeDataId } from "@tint-ui/theme";

export enum DATA_ATTRIBUTES {
	BLOCK = "data-block",
	BLOCK_WRAPPER = "data-block-wrapper",
	BUTTON = "data-button",
	CHIP = "data-chip",
	FILTER_FORM = "data-filter-form",
	FORM = "data-form",
	ICON = "data-icon",
	INPUT = "data-input",
	INPUT_LABEL = "data-input-label",
	INPUT_WRAPPER = "data-input-wrapper",
	LINK = "data-link",
	LIST_ITEM = "data-list-item",
	NAV_BUTTON = "data-nav-button",
	NAV_LINK = "data-nav-link",
	POPOVER = "data-popover",
	SELECTED_ITEM = "data-selected-item",
	SELECT_GROUP = "data-select-group",
	SELECT_ITEM = "data-select-item",
	SELECT_TEXT = "data-select-text",
	TABLE = "data-table",
	TABLE_CELL = "data-table-cell",
	TABLE_HEADER_CELL = "data-table-header-cell",
	TABLE_HEADER_ROW = "data-table-header-row",
	TABLE_PAGINATION = "data-table-pagination",
	TABLE_ROW = "data-table-row",
	TABLE_HEADER = "data-table-header",
	TABLE_FOOTER = "data-table-footer",
	TABLE_BODY = "data-table-body",
	TEXT = "data-text",
}

export const findDataId = function <T extends object>(props: T): null | { value: string; props: T } {
	// data-id as unique identifier
	if (attributeDataId in props && typeof props[attributeDataId] === "string") {
		const { [attributeDataId]: value, ...rest } = props;
		return {
			value,
			props: rest as T,
		};
	}
	return null;
};

export const dataIdProps = function <T extends { id?: string }>(
	props: T,
	property: `data-${string}`,
	prefix: string,
	{
		required = true,
		alternativeProperty,
	}: {
		required?: boolean;
		alternativeProperty?: keyof T;
	} = {}
): T {
	const dataId = findDataId(props);
	if (dataId) {
		return {
			[property]: `${prefix}--${dataId.value}`,
			...dataId.props,
		} as T;
	}

	if (property in props) {
		return props;
	}

	let attrValue: string;

	// try to create from other props
	if (alternativeProperty && typeof props[alternativeProperty] === "string" && props[alternativeProperty] !== "") {
		attrValue = `${prefix}-${alternativeProperty as string}-${props[alternativeProperty]}`;
	} else {
		const { id } = props;
		if (id) {
			attrValue = `${prefix}-id-${id}`;
		} else if (required) {
			attrValue = prefix;
		} else {
			return props;
		}
	}

	return {
		[property]: attrValue,
		...props,
	} as T;
};
