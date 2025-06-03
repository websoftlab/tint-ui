import type { ComponentPropsWithoutRef, ComponentPropsWithRef, ElementType, ComponentProps, ReactElement } from "react";
import type { WeakValidationMap, ValidationMap } from "prop-types";

// input select helper

/**
 * Represents an option for an input select component.
 *
 * @property {string} label - The label text for the option.
 * @property {string | number} value - The value of the option.
 * @property {boolean} [disabled] - Whether the option is disabled.
 */
export interface InputSelectOption {
	label: string;
	value: string | number;
	disabled?: boolean;
}

/**
 * Represents a group of options for an input select component.
 *
 * @property {string} [label] - The label text for the group.
 * @property {InputSelectOption[]} options - The array of options in the group.
 */
export interface InputSelectOptionGroup {
	label?: string | undefined;
	options: InputSelectOption[];
}

// as types

type As = ElementType;

type PropsOf<T extends As> = ComponentPropsWithoutRef<T> & {
	as?: As;
};

type OmitCommonProps<Target, OmitAdditionalProps extends keyof any = never> = Omit<Target, "as" | OmitAdditionalProps>;

type RightJoinProps<SourceProps extends object = {}, OverrideProps extends object = {}> = OmitCommonProps<
	SourceProps,
	keyof OverrideProps
> &
	OverrideProps;

type MergeWithAs<
	ComponentProps extends object,
	AsProps extends object,
	AdditionalProps extends object = {},
	AsComponent extends As = As
> = (RightJoinProps<ComponentProps, AdditionalProps> | RightJoinProps<AsProps, AdditionalProps>) & {
	as?: AsComponent;
};

type WithAs<Component extends As, Props extends object = {}> = {
	<AsComponent extends As = Component>(
		props: MergeWithAs<ComponentProps<Component>, ComponentProps<AsComponent>, Props, AsComponent>
	): ReactElement;

	displayName?: string;
	propTypes?: WeakValidationMap<any>;
	contextTypes?: ValidationMap<any>;
	defaultProps?: Partial<any>;
	id?: string;
};

/**
 * Represents the ref property of a component.
 *
 * @template T - The type of the component.
 * @returns {ComponentPropsWithRef<T>["ref"]} The ref property of the component.
 */
export type AsRef<T extends ElementType> = ComponentPropsWithRef<T>["ref"];

/**
 * Represents an As component.
 *
 * @template T - The type of the component.
 * @template P - The properties of the component.
 */
export interface AsComponent<T extends As, P extends object = {}> extends WithAs<T, P> {}

/**
 * Represents an As component with a ref.
 *
 * @template T - The type of the component.
 * @template P - The properties of the component.
 *
 * @returns {Omit<PropsOf<T>, "ref" | keyof P> & OmitCommonProps<P>} The properties of the As component with a ref.
 */
export interface AsComponentWithRef<T extends As, P extends object = {}>
	extends WithAs<
		T,
		Omit<P, "ref"> & {
			ref?: AsRef<T>;
		}
	> {}

/**
 * Represents the properties of an As component.
 *
 * @template T - The type of the component.
 * @template P - The properties of the component.
 *
 * @returns {Omit<PropsOf<T>, "ref" | keyof P> & OmitCommonProps<P>} The properties of the As component.
 */
export type AsProps<T extends As, P extends object = {}> = Omit<PropsOf<T>, "ref" | keyof P> & OmitCommonProps<P>;
