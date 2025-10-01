"use client";

import type { InputSelectOption, InputSelectOptionGroup } from "@tint-ui/tools";
import type { CSSProperties, MutableRefObject, Ref } from "react";
import type {
	InputSelectProps,
	InputSelectTag,
	OptionCallbackType,
	OptionType,
	OptionValueType,
	OptionQueryMode,
} from "./types";

import * as React from "react";
import { makeOption } from "@tint-ui/tools/make-option";
import { errorMessage } from "@tint-ui/tools/error-message";
import { resizeElement } from "@tint-ui/tools/resize-element";
import { useForkRef } from "@tint-ui/tools/use-fork-ref";
import { getValue } from "./get-value";
import { getText } from "./lexicon";

type OptionsState<T extends OptionValueType> = {
	dump: Partial<Record<T, InputSelectOption>>;
	count: number;
	options: InputSelectOptionGroup[];
};

type OptionsControllerState<T extends OptionValueType> = OptionsState<T> & {
	inputText: string;
	text: string;
	loading: boolean;
	loaded: boolean;
	error: null | string;
};

const getPlaceholder = <T extends OptionValueType>(dump: Partial<Record<T, InputSelectOption>>, id: T): string => {
	const option = dump[id];
	if (option && dump.hasOwnProperty(id)) {
		return option.label;
	}
	return String(id === "" ? "- x -" : id);
};

const getOption = <T extends OptionValueType>(
	dump: Partial<Record<T, InputSelectOption>>,
	id: T
): InputSelectOption => {
	const option = dump[id];
	if (!option || !dump.hasOwnProperty(id)) {
		return {
			value: id,
			label: String(id === "" ? "- x -" : id),
		};
	}
	return option;
};

const getOptions = function <T extends OptionValueType>(
	options: OptionType[],
	lastOptions: InputSelectOptionGroup[] = []
): OptionsState<T> {
	let lastGroup: InputSelectOptionGroup | null = null;
	let count = 0;

	const refs = new Map<string, InputSelectOptionGroup>();
	const dump: Partial<Record<T, InputSelectOption>> = {};
	const merge = (options: OptionType[]) => {
		for (let option of options) {
			if (typeof option !== "string" && "options" in option) {
				const label = String(option.label);
				const exists = refs.has(label);
				const group: InputSelectOptionGroup = exists
					? refs.get(label)!
					: {
							label: option.label,
							options: [],
					  };
				Array.from(option.options).forEach((item) => {
					const option = makeOption(item, dump);
					if (option) {
						count++;
						group.options.push(option);
					}
				});
				if (!exists && group.options.length) {
					refs.set(label, group);
				}
			} else {
				const item = makeOption(option, dump);
				if (!item) {
					continue;
				}
				count++;
				if (!lastGroup) {
					lastGroup = { options: [item] };
				} else {
					lastGroup.options.push(item);
				}
			}
		}
	};

	if (lastOptions.length) {
		merge(lastOptions);
	}
	if (options.length) {
		merge(options);
	}

	const calc = Array.from(refs.values());
	if (lastGroup != null) {
		calc.push(lastGroup);
	}

	return {
		options: calc,
		dump,
		count,
	};
};

const renderOptionDefault = (option: InputSelectOption) => option.label;

const renderTagDefault = (tag: InputSelectTag) => tag.option.label;

const createControllerState = function <T extends OptionValueType>(
	initialState?: OptionType[] | undefined | null,
	valueRef?: MutableRefObject<T | T[] | null>
): OptionsControllerState<T> {
	if (initialState != null) {
		const opts = getOptions<T>(initialState);
		let values = valueRef?.current;
		if (!Array.isArray(values)) {
			values = values == null ? [] : [values];
		}
		return {
			...opts,
			inputText: "",
			text: "",
			loading: false,
			loaded: values.every((value) => opts.dump.hasOwnProperty(value)),
			error: null,
		};
	}
	return { dump: {}, count: 0, options: [], inputText: "", text: "", loading: false, loaded: false, error: null };
};

const useController = function <T extends OptionValueType>(
	callback: OptionCallbackType<T> | null,
	initialState: OptionType[] | null,
	valueRef: MutableRefObject<T | T[] | null>
) {
	const [state, setState] = React.useState<OptionsControllerState<T>>(() =>
		createControllerState(initialState, valueRef)
	);
	const ref = React.useRef<OptionCallbackType<T> | null>(null);
	const initRef = React.useRef(false);

	const { onCheckValue, onMount, onReload, onChangeText } = React.useMemo(() => {
		let localState: OptionsControllerState<T> = state;
		let mount = false;
		let abortController: AbortController | null = null;
		let lazyId: number | null = null;

		const lazyClear = () => {
			if (lazyId != null) {
				window.clearTimeout(lazyId);
				lazyId = null;
			}
		};

		const abort = () => {
			if (abortController != null) {
				abortController.abort();
				abortController = null;
			}
		};

		const update = (data: Partial<OptionsControllerState<T>>) => {
			if (!mount) {
				return;
			}
			localState = {
				...localState,
				...data,
			};
			setState(localState);
		};

		const query = (force = false, mode: OptionQueryMode = "search") => {
			if (!mount) {
				return;
			}

			const callback = ref.current;
			const text = localState.inputText.trim();
			if (callback == null) {
				return update({ loading: false, loaded: true, error: null, text });
			}
			if (!force && localState.text === text) {
				return;
			}

			abort();
			update({ loading: true, error: null, text });
			const values = Array.isArray(valueRef.current)
				? valueRef.current
				: valueRef.current == null
				? []
				: [valueRef.current];
			const saveDump = localState.dump;

			abortController = new AbortController();
			const signal = abortController.signal;
			(async (...args: [string, T[], OptionQueryMode, AbortController]) => callback(...args))(
				text,
				values,
				mode,
				abortController
			)
				.then((options) => {
					const state = getOptions(options, mode === "lost" ? localState.options : []);
					for (const id of values) {
						if (!state.dump[id] && saveDump[id]) {
							state.dump[id] = saveDump[id];
						}
					}
					update({
						loading: false,
						loaded: true,
						...state,
					});
				})
				.catch((error) => {
					if (signal.aborted) {
						return;
					}
					update({
						loading: false,
						error: errorMessage(error).message,
					});
				})
				.finally(() => {
					abortController = null;
				});
		};

		return {
			onCheckValue(value: T | T[]) {
				if (!Array.isArray(value)) {
					value = [value];
				}
				if (!value.some((id) => localState.dump.hasOwnProperty(id))) {
					query(true, "lost");
				}
			},
			onChangeText(text: string, focus = false) {
				lazyClear();
				update({ inputText: text });
				lazyId = window.setTimeout(
					() => {
						lazyId = null;
						query(focus);
					},
					focus ? 50 : 300
				);
			},
			onReload(newState: OptionsControllerState<T>, initial = false) {
				abort();
				localState = newState;
				setState(localState);
				if (!localState.loaded) {
					query(true, initial ? "initial" : "search");
				}
			},
			onMount() {
				mount = true;
				return () => {
					mount = false;
				};
			},
		};
	}, []);

	React.useEffect(onMount, [onMount]);
	React.useEffect(() => {
		if (ref.current === callback) {
			return;
		}
		ref.current = callback;
		if (typeof callback === "function") {
			initRef.current = true;
			onReload(createControllerState(initialState, valueRef), true);
		} else {
			setState(createControllerState());
		}
	}, [callback, onReload]);

	// If the current value has been changed
	const currentValue = valueRef.current;
	React.useEffect(() => {
		if (initRef.current) {
			initRef.current = false;
		} else if (currentValue != null && typeof ref.current === "function") {
			onCheckValue(currentValue);
		}
	}, [currentValue, onCheckValue]);

	return {
		...state,
		onChangeText,
	};
};

export const useSelect = <T extends OptionValueType = string>(props: InputSelectProps<T>) => {
	let {
		options: optionsProp = [],
		lexicon = {},
		initialOptions = [],
		innerRef,
		value: valueProp,
		onSelectOption: onSelectOptionProp,
		required = false,
		clearable = !required,
		multiple = false,
		tagged = true,
		valueAsNumber = false,
		disableSearch = false,
		renderOption = renderOptionDefault,
		renderTag = renderTagDefault,
		tagsProps = {},
		popoverProps = {},
		size,
		name,
		readOnly,
		inputHidden = false,
		...rest
	} = props;

	// hidden field is used only if component name is not empty
	if (!name) {
		inputHidden = false;
	}

	// readonly flag support only for input
	if (readOnly === true) {
		rest.disabled = true;
	}

	const [nativeValue, setNativeValue] = React.useState<T | T[] | null>(null);
	const { onSelectOption, isOptionSelected, value } = React.useMemo(() => {
		const close = () => {
			setOpen(false);
		};
		const isOptionSelected = (value: T) => {
			const testValue = onSelectOptionProp ? valueProp : nativeValue;
			if (multiple) {
				if (testValue == null) {
					return false;
				}
				if (Array.isArray(testValue)) {
					return testValue.includes(value);
				}
			}
			return testValue === value;
		};

		if (onSelectOptionProp) {
			return {
				value: valueProp || null,
				isOptionSelected,
				onSelectOption: (value: string | null) => {
					let option: InputSelectOption | null = null;
					if (value != null) {
						option = getOption(refController.current.dump, value as T);
					}
					onSelectOptionProp!(value, { option, close });
				},
			};
		}

		return {
			value: nativeValue,
			isOptionSelected,
			onSelectOption: (value: string | null) => {
				const test = getValue(nativeValue, value, { multiple, clearable, valueAsNumber });
				if (test.valid) {
					setNativeValue(test.value as T);
					if (!multiple) {
						close();
					}
				}
			},
		};
	}, [nativeValue, valueProp, onSelectOptionProp, clearable, multiple, valueAsNumber]);

	const valueRef = React.useRef(value);
	valueRef.current = value;

	// calculate controller options
	const controller = useController<T>(
		typeof optionsProp === "function" ? optionsProp : null,
		initialOptions,
		valueRef
	);

	const refController = React.useRef(controller);
	refController.current = controller;

	// calculate options props
	const { options, dump, count, inputController } = React.useMemo(() => {
		if (typeof optionsProp !== "function") {
			return { ...getOptions(optionsProp), inputController: null };
		}
		return {
			get options() {
				return refController.current.options;
			},
			get dump() {
				return refController.current.dump;
			},
			get count() {
				return refController.current.count;
			},
			inputController: {
				get value() {
					return refController.current.inputText;
				},
				onValueChange(text: string) {
					refController.current.onChangeText(text);
				},
				onFocus() {
					const { onChangeText, inputText } = refController.current;
					onChangeText(inputText, true);
				},
			},
		};
	}, [optionsProp]);

	const [open, setOpen] = React.useState(false);

	// calculate button size
	const buttonRef = React.useRef<HTMLButtonElement>(null);
	const popoverRef = React.useRef<HTMLDivElement>(null);
	const popoverStyleRef = React.useRef<CSSProperties>({});
	const forkRef: Ref<HTMLButtonElement> = useForkRef(buttonRef, innerRef as Ref<HTMLButtonElement>);

	React.useEffect(() => {
		const ref = buttonRef.current;
		if (!ref) {
			return;
		}
		return resizeElement(
			ref,
			(calc) => {
				const popover = popoverRef.current;
				const property = "--popover-width" as keyof CSSProperties;
				const value = `${calc.width}px`;
				popoverStyleRef.current[property as "width"] = value;
				if (popover) {
					popover.style.setProperty(property, value);
				}
			},
			{ initialEmit: true }
		);
	}, []);

	const tags: InputSelectTag[] = [];

	let placeholder: string | null = null;
	let isFill = false;
	if (multiple && Array.isArray(value)) {
		isFill = value.length !== 0;
		if (isFill) {
			if (value.length === 1) {
				placeholder = getPlaceholder(dump, value[0]);
			} else {
				placeholder = getText(lexicon, "selected", { count: value.length });
				tagged &&
					value.forEach((id) => {
						tags.push({
							id,
							option: getOption(dump, id),
							onClear() {
								onSelectOption(`${id}`);
							},
						});
					});
			}
		}
	} else if (value != null) {
		isFill = true;
		if (!Array.isArray(value)) {
			placeholder = getPlaceholder(dump, value);
		} else if (value.length > 0) {
			placeholder = getPlaceholder(dump, value[0]);
		}
	}

	const isControl = inputController != null;
	return {
		lexicon: {
			placeholder: placeholder == null ? getText(lexicon, "placeholder") : placeholder,
			notFound: getText(
				lexicon,
				count === 0 && (inputController == null || inputController.value.length === 0) ? "empty" : "notFound"
			),
			search: getText(lexicon, "search"),
			loading: getText(lexicon, "loading"),
		},
		innerRef: forkRef,
		name,
		value,
		inputHidden,
		tags,
		size,
		open,
		setOpen,
		onSelectOption,
		isOptionSelected,
		renderOption,
		renderTag,
		inputController,
		count,
		options,
		popoverRef,
		clearable: clearable && isFill,
		disableSearch: isControl ? false : disableSearch,
		popoverStyle: popoverStyleRef.current,
		buttonProps: rest,
		error: isControl ? controller.error : null,
		loaded: isControl ? controller.loaded : true,
		loading: isControl ? controller.loading : false,
		tagsProps,
		popoverProps,
	};
};
