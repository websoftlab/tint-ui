import type { HTMLAttributes, HTMLProps, ReactNode, Ref } from "react";
import type { InputSelectOption, InputSelectOptionGroup } from "@tint-ui/tools";
import type { PopoverContentProps } from "@tint-ui/popover";

export type OptionValueType = number | string;

export type OptionType = InputSelectOption | InputSelectOptionGroup | string;

export type OptionCallbackType<T extends OptionValueType> = (
	text: string,
	values: T[],
	abortController: AbortController
) => OptionType[] | Promise<OptionType[]>;

export type InputSelectLexicon = {
	placeholder: string | (() => string);
	loading: string | (() => string); // Hang on…
	search: string | (() => string);
	notFound: string | (() => string);
	empty: string | (() => string);
	selected: string | ((data: { count: number }) => string);
};

export type InputSelectSize = "md" | "lg" | "sm" | "xs";

export type TagGroupProps = Omit<HTMLProps<HTMLDivElement>, "size"> & {
	size?: InputSelectSize | null;
};

export interface InputSelectProps<T extends OptionValueType = string>
	extends Omit<HTMLAttributes<HTMLButtonElement>, "type"> {
	options?: OptionType[] | OptionCallbackType<T>;
	lexicon?: Partial<InputSelectLexicon>;
	initialOptions?: OptionType[];
	disableSearch?: boolean;
	value?: T[] | T | null;
	innerRef?: Ref<HTMLButtonElement>;
	onSelectOption?: (value: string | null, close: () => void) => void;
	renderOption?: (option: InputSelectOption) => ReactNode;
	size?: InputSelectSize | null;
	clearable?: boolean;
	required?: boolean;
	disabled?: boolean;
	invalid?: boolean;
	multiple?: boolean;
	tagged?: boolean;
	valueAsNumber?: boolean;
	tagsProps?: TagGroupProps;
	popoverProps?: PopoverContentProps;
}
