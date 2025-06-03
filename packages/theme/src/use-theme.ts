import * as React from "react";
import { ThemeContext } from "./context";
import { reaction } from "mobx";

export const useTheme = () => React.useContext(ThemeContext);

export const useThemeMode = () => {
	const theme = useTheme();
	const [mode, setMode] = React.useState(theme.theme);
	React.useEffect(() => {
		if (mode !== theme.theme) {
			setMode(theme.theme);
		}
		return reaction(() => theme.theme, setMode);
	}, [theme]);
	return mode;
};
