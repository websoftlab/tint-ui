"use client";

import * as React from "react";
import { ThemeStore } from "./theme-store";

type FormPrefixContextType = {
	prefix: string;
	path: (string | number)[];
	depth: number;
	joinName(value: string | number, separator: string): string;
	getName(value: string | number): string;
};

interface WithMixinThemeProps {
	children: React.ReactNode;
	name: string;
}

const defaultThemeStore = new ThemeStore();

const ThemeContext = React.createContext<ThemeStore>(defaultThemeStore);

const LayerContext = React.createContext<string | null>(null);

const FormPrefixContext = React.createContext<FormPrefixContextType>({
	prefix: "",
	path: [],
	depth: 0,
	joinName(value: string | number): string {
		return String(value);
	},
	getName(name: string | number) {
		return String(name);
	},
});

const WithMixinTheme = ({ children, name }: WithMixinThemeProps) => {
	const baseTheme = React.useContext(ThemeContext);
	const theme = React.useMemo(() => {
		const mixin = baseTheme.mixin[name];
		if (mixin == null) {
			return baseTheme;
		}
		return new ThemeStore({
			root: baseTheme,
			classesMode: baseTheme.classesMode,
			theme: baseTheme.theme,
			classes: mixin.classes,
			icons: mixin.icons,
			mixin: baseTheme.mixin,
			dataId: baseTheme.dataId,
		});
	}, [baseTheme, name]);
	return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
};

const LayerProvider = ({ value, children }: { children: React.ReactNode; value: string }) => {
	const theme = React.useContext(ThemeContext);
	const parent = React.useContext(LayerContext);
	if (parent) {
		value = parent + theme.dataId.separator + value;
	}
	return React.createElement(LayerContext.Provider, {
		children,
		value,
	});
};

ThemeContext.displayName = "ThemeContext";
LayerContext.displayName = "LayerContext";
FormPrefixContext.displayName = "FormPrefixContext";
LayerProvider.displayName = "LayerProvider";

export { defaultThemeStore, ThemeContext, LayerContext, FormPrefixContext, WithMixinTheme };
export type { WithMixinThemeProps, FormPrefixContextType };
