import * as React from "react";

type FormPrefixContextType = {
	prefix: string;
	path: (string | number)[];
	depth: number;
	getName(value: string | number): string;
};

const FormPrefix = React.createContext<FormPrefixContextType>({
	prefix: "",
	path: [],
	depth: 0,
	getName(name: string | number) {
		return String(name);
	},
});

FormPrefix.displayName = "FormPrefix";

const useFormPrefix = () => {
	return React.useContext(FormPrefix);
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
		getName(value: string | number): string {
			return `${prefix}.${value}`;
		},
	};
	return React.createElement(FormPrefix.Provider, {
		children: props.children,
		value,
	});
};

FormPrefixProvider.displayName = "FormPrefixProvider";

export { FormPrefixProvider, useFormPrefix };
