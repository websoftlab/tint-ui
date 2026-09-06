import type { FormPrefixContextType } from "@tint-ui/theme";

import * as React from "react";
import { FormPrefixContext } from "@tint-ui/theme";

const useFormPrefix = () => {
	return React.useContext(FormPrefixContext);
};

const FormPrefixProvider = (props: { children: React.ReactNode; value: string | number }) => {
	const parent = useFormPrefix();
	const path = [...parent.path, props.value];
	const depth = path.length;
	const prefix = path.join(".");
	const value: FormPrefixContextType = {
		path,
		depth,
		prefix,
		joinName(value: string | number, separator: string): string {
			let result = String(path[0]);
			for (let i = 1; i < path.length; i++) {
				result += separator + path[i];
			}
			return result + separator + value;
		},
		getName(value: string | number): string {
			return `${prefix}.${value}`;
		},
	};
	return React.createElement(FormPrefixContext.Provider, {
		children: props.children,
		value,
	});
};

FormPrefixProvider.displayName = "FormPrefixProvider";

export { FormPrefixProvider, useFormPrefix };
