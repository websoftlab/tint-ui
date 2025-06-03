"use client";

import type {
	InputHTMLAttributes,
	Ref,
	ForwardRefExoticComponent,
	RefAttributes,
	ChangeEventHandler,
	ForwardedRef,
} from "react";
import type { InputSelectOption } from "@tint-ui/tools";

import * as React from "react";
import clsx from "clsx";
import { useProps as useThemeProps } from "@tint-ui/theme";
import { makeOption } from "@tint-ui/tools/make-option";
import { useForkRef } from "@tint-ui/tools/use-fork-ref";
import { useInputCheckboxClasses } from "./classes";

type InputCheckboxSize = "sm" | "md" | "lg";

interface InputCheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
	invalid?: boolean;
	indeterminate?: boolean;
	size?: InputCheckboxSize;
}

interface InputCheckboxLabelProps extends InputHTMLAttributes<HTMLLabelElement> {
	inputProps?: InputCheckboxProps;
	inputRef?: Ref<HTMLInputElement>;
}

interface InputCheckboxGroupProps<T extends string | number = string>
	extends Omit<InputHTMLAttributes<HTMLDivElement>, "size" | "value" | "onChange"> {
	options?: (InputSelectOption | string)[];
	value?: T | T[] | null;
	onChange?: ChangeEventHandler<HTMLInputElement>;
	multiple?: boolean;
	vertical?: boolean;
	invalid?: boolean;
	inputId?: string;
	invalidMode?: "first" | "all";
	size?: InputCheckboxSize;
}

const useProps = (
	type: "radio" | "checkbox",
	{ indeterminate = false, size, ...rest }: InputCheckboxProps,
	ref: ForwardedRef<HTMLInputElement>
) => {
	const inputRef = React.useRef<HTMLInputElement>(null);
	const classes = useInputCheckboxClasses();
	const forkRef = useForkRef(ref, inputRef);

	React.useEffect(() => {
		if (type === "checkbox" && inputRef.current) {
			inputRef.current.indeterminate = indeterminate;
		}
	}, [indeterminate, type]);

	const { className, invalid, ...props } = useThemeProps(`component.input-${type}`, rest, {
		as: "input",
		type,
		indeterminate,
	});

	return {
		"aria-invalid": invalid,
		...props,
		type,
		className: clsx(classes.checkbox, classes[size || "md"], className),
		ref: forkRef,
	};
};

const createComponent = (type: "radio" | "checkbox", displayName: string) => {
	const component = React.forwardRef<HTMLInputElement, InputCheckboxProps>((props, ref) => {
		const inputProps = useProps(type, props, ref);
		return <input {...inputProps} />;
	});
	component.displayName = displayName;
	return component;
};

const InputCheckbox = createComponent("checkbox", "InputCheckbox");

const InputRadio = createComponent("radio", "InputRadio");

const labelDetail = {
	checkbox: {
		displayName: "InputCheckboxLabel",
		propsType: "component.input-checkbox-label",
	},
	radio: {
		displayName: "InputRadioLabel",
		propsType: "component.input-radio-label",
	},
};

const createLabelComponent = (
	Base: ForwardRefExoticComponent<InputCheckboxProps & RefAttributes<HTMLInputElement>>,
	type: "radio" | "checkbox"
) => {
	const { displayName, propsType } = labelDetail[type];
	const component = React.forwardRef<HTMLLabelElement, InputCheckboxLabelProps>(
		({ inputProps, inputRef, children, ...rest }, ref) => {
			const classes = useInputCheckboxClasses();
			if (React.isValidElement<{ className?: string }>(children)) {
				children = React.cloneElement(children, {
					className: clsx(children.props.className, classes.labelText),
				});
			} else {
				children = <span className={classes.labelText}>{children}</span>;
			}
			const { className, ...labelProps } = useThemeProps(propsType, rest, { as: "label" });
			return (
				<label {...labelProps} data-type="label-group" className={clsx(classes.label, className)} ref={ref}>
					<Base {...inputProps} ref={inputRef} />
					{children}
				</label>
			);
		}
	);
	component.displayName = displayName;
	return component;
};

const InputCheckboxLabel = createLabelComponent(InputCheckbox, "checkbox");

const InputRadioLabel = createLabelComponent(InputRadio, "radio");

const InputCheckboxGroup = React.forwardRef<HTMLDivElement, InputCheckboxGroupProps>((props, ref) => {
	const { value: valueProp, options: optionsProp = [], multiple = false, size, ...rest } = props;

	const classes = useInputCheckboxClasses();
	const dump: Partial<Record<string | number, string>> = {};
	const options: InputSelectOption[] = [];

	if (Array.isArray(optionsProp)) {
		optionsProp.forEach((item) => {
			const option = makeOption(item, dump);
			if (option != null) {
				options.push(option);
			}
		});
	}

	const values: (string | number)[] = Array.isArray(valueProp) ? valueProp : valueProp == null ? [] : [valueProp];
	const Inp = multiple ? InputCheckboxLabel : InputRadioLabel;

	const {
		className,
		vertical = false,
		invalidMode = "first",
		name,
		invalid,
		inputId,
		onChange,
		onBlur,
		disabled,
		required,
		...checkboxGroup
	} = useThemeProps("component.input-checkbox-group", rest, {
		as: "div",
		options,
		values,
		multiple,
	});

	const isFirstRequired = required && values.length === 0;
	const invalidModeAll = invalidMode === "all";

	return (
		<div
			data-type="option-group"
			data-direction={vertical ? "vertical" : "horizontal"}
			{...checkboxGroup}
			className={clsx(classes.group, classes[vertical ? "vertical" : "horizontal"], className)}
			ref={ref}
		>
			{options.map((item, index) => {
				const { value } = item;
				const first = index === 0;
				return (
					<Inp
						key={value}
						inputProps={{
							name,
							onChange,
							onBlur,
							size,
							id: inputId == null ? undefined : first ? inputId : `${inputId}--${index}`,
							disabled: item.disabled || disabled,
							invalid: invalid ? invalidModeAll || first : false,
							required: first && isFirstRequired,
							value: value,
							checked: values.includes(value),
						}}
					>
						{item.label}
					</Inp>
				);
			})}
		</div>
	);
});

InputCheckboxGroup.displayName = "InputCheckboxGroup";

export { InputCheckbox, InputRadio, InputCheckboxLabel, InputRadioLabel, InputCheckboxGroup };
export type { InputCheckboxProps, InputCheckboxLabelProps, InputCheckboxGroupProps, InputCheckboxSize };
