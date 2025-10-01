import type {
	FormGridFieldHiddenType,
	FormGridFieldType,
	FormGridGroupCol,
	FormGridGroupHeading,
	FormGridThenRule,
} from "./types";

import * as React from "react";
import { useFormGridSize } from "./context";
import { calculateFieldsGroup } from "./use-calculate-grid-size";
import { isArrayType, isObjectType } from "./type-of";
import { FormGridFieldArray } from "./form-grid-field-array";
import { FormGridFieldObject } from "./form-grid-field-object";
import { FormGridFieldItem } from "./form-grid-field-item";
import { FormGridGroup } from "./form-grid-group";
import { createKeyControl } from "./create-key-control";
import { FormGridRule } from "./form-grid-rule";
import { FormGridHeading } from "./form-grid-heading";

const isHeading = (col: FormGridGroupHeading | FormGridGroupCol[]): col is FormGridGroupHeading => {
	return "heading" in col;
};

const FormGridList = (props: {
	disabled?: boolean;
	themePropsType?: string;
	fields: (FormGridFieldType | FormGridFieldHiddenType)[];
	rules?: Record<string, FormGridThenRule>;
}) => {
	const { disabled, themePropsType, rules = {} } = props;
	const fields = props.fields.filter((item) => item.type !== "hidden") as FormGridFieldType[];
	const size = useFormGridSize();
	const grid = calculateFieldsGroup(size, fields);
	const createKey = createKeyControl();
	return (
		<>
			{grid.map((col, index) => {
				if (isHeading(col)) {
					return (
						<FormGridHeading id={col.id} themePropsType={themePropsType} key={index}>
							{col.heading}
						</FormGridHeading>
					);
				}
				return (
					<FormGridGroup themePropsType={themePropsType} key={index}>
						{col.map(({ field, col }) => {
							const keyId = createKey(field.name);
							const rule = rules[field.name];

							let required = false;
							let fieldNode: React.JSX.Element;

							if (isArrayType(field)) {
								if (field.min && field.min > 0) {
									required = true;
								}
								fieldNode = (
									<FormGridFieldArray
										key={keyId}
										field={field}
										disabled={disabled}
										removable={!required && rule != null ? false : undefined}
										themePropsType={themePropsType}
									/>
								);
							} else if (isObjectType(field)) {
								if (field.required) {
									required = true;
								}
								fieldNode = (
									<FormGridFieldObject
										key={keyId}
										field={field}
										disabled={disabled}
										removable={!required && rule != null ? false : undefined}
										themePropsType={themePropsType}
									/>
								);
							} else {
								if (field.required) {
									required = true;
								}
								fieldNode = (
									<FormGridFieldItem
										key={keyId}
										col={col}
										field={field}
										disabled={disabled}
										themePropsType={themePropsType}
									/>
								);
							}

							if (rule && !required) {
								return (
									<FormGridRule key={`rule:${keyId}`} rule={rule} field={field}>
										{fieldNode}
									</FormGridRule>
								);
							}

							return fieldNode;
						})}
					</FormGridGroup>
				);
			})}
		</>
	);
};

FormGridList.displayName = "FormGridList";

type FormGridListProps = React.ComponentProps<typeof FormGridList>;

export { FormGridList };
export type { FormGridListProps };
