import type { HTMLAttributes, HTMLProps, ReactNode, Ref } from "react";
import type { InputSelectOption, InputSelectOptionGroup } from "@tint-ui/tools";
import type { PopoverContentProps } from "@tint-ui/popover";

/**
 * The type of the value of the option.
 */
export type OptionValueType = number | string;

/**
 * The type of the option.
 */
export type OptionType = InputSelectOption | InputSelectOptionGroup | string;

/**
 * The mode of the option query.
 */
export type OptionQueryMode = "initial" | "lost" | "search";

/**
 * The type of the tag.
 */
export type InputSelectTag<T extends OptionValueType = OptionValueType, P = object> = {
	id: T;
	option: InputSelectOption<P>;
	onClear(): void;
};

/**
 * The type of the option callback for dynamic options.
 */
export type OptionCallbackType<T extends OptionValueType> = (
	text: string,
	values: T[],
	mode: OptionQueryMode,
	abortController: AbortController
) => OptionType[] | Promise<OptionType[]>;

/**
 * The lexicon of the input select.
 */
export type InputSelectLexicon = {
	placeholder: string | (() => string);
	loading: string | (() => string); // Hang on…
	search: string | (() => string);
	notFound: string | (() => string);
	empty: string | (() => string);
	selected: string | ((data: { count: number }) => string);
};

/**
 * The size of the input select.
 */
export type InputSelectSize = "md" | "lg" | "sm" | "xs";

/**
 * The props of the tag group.
 */
export type TagGroupProps = Omit<HTMLProps<HTMLDivElement>, "size"> & {
	size?: InputSelectSize | null;
};

/**
 * The props of the input select.
 */
export interface InputSelectProps<T extends OptionValueType = string>
	extends Omit<HTMLAttributes<HTMLButtonElement>, "type"> {
	/**
	 * The name of the input select.
	 */
	name?: string;
	/**
	 * The options of the input select.
	 */
	options?: OptionType[] | OptionCallbackType<T>;
	/**
	 * The lexicon of the input select.
	 */
	lexicon?: Partial<InputSelectLexicon>;
	/**
	 * The initial options of the input select.
	 */
	initialOptions?: OptionType[];
	/**
	 * Whether to disable the search input.
	 */
	disableSearch?: boolean;
	/**
	 * The value of the input select.
	 */
	value?: T[] | T | null;
	/**
	 * The inner ref of the input select.
	 */
	innerRef?: Ref<HTMLButtonElement>;
	/**
	 * The callback function to select an option.
	 */
	onSelectOption?: (value: string | null, options: { option: InputSelectOption | null; close: () => void }) => void;
	/**
	 * The callback function to render an option.
	 */
	renderOption?: (option: InputSelectOption) => ReactNode;
	/**
	 * The callback function to render a tag.
	 */
	renderTag?: (tag: InputSelectTag) => ReactNode;
	/**
	 * The size of the input select.
	 */
	size?: InputSelectSize | null;
	/**
	 * Whether the input select is clearable.
	 */
	clearable?: boolean;
	/**
	 * Whether the input select is required.
	 */
	required?: boolean;
	/**
	 * Whether the input select is disabled.
	 */
	disabled?: boolean;
	/**
	 * Whether the input select is read only.
	 */
	readOnly?: boolean;
	/**
	 * Whether the input select is invalid.
	 */
	invalid?: boolean;
	/**
	 * Whether the input select is multiple.
	 */
	multiple?: boolean;
	/**
	 * Whether the input select is tagged.
	 */
	tagged?: boolean;
	/**
	 * Whether the input select value is a number.
	 */
	valueAsNumber?: boolean;
	/**
	 * The props of the tag group.
	 */
	tagsProps?: TagGroupProps;
	/**
	 * The props of the popover.
	 */
	popoverProps?: PopoverContentProps;
	/**
	 * Outputs `<input type="hidden" />` with name and value, name attribute is required.
	 */
	inputHidden?: boolean;
}
