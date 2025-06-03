"use client";

import type { ReactNode } from "react";

import * as React from "react";
import { ThemeStore } from "./theme-store";

const defaultThemeStore = new ThemeStore();

const ThemeContext = React.createContext<ThemeStore>(defaultThemeStore);

interface WithMixinThemeProps {
	children: ReactNode;
	name: string;
}

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
		});
	}, [baseTheme, name]);
	return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
};

export { defaultThemeStore, ThemeContext, WithMixinTheme };
export type { WithMixinThemeProps };
