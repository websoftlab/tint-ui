import type { ThemePropsTypeOptions } from "./types";

import { useTheme } from "./use-theme";

export const useProps = function <T extends object, Attr extends object = object>(
	name: string,
	props: T & { themePropsType?: string },
	options: ThemePropsTypeOptions<Attr> = {} as ThemePropsTypeOptions<Attr>
): T {
	const theme = useTheme();
	let themeProps = theme.getProps<T>(name);
	if (props.themePropsType) {
		const { themePropsType, ...rest } = props;
		props = rest as T;
		const suffixName = `${name}->${themePropsType}`;
		if (theme.hasProps(suffixName)) {
			themeProps = theme.getProps<T>(suffixName);
		}
	}
	if (!themeProps) {
		return props;
	}
	if (typeof themeProps === "function") {
		return themeProps(props, name, options);
	}
	return { ...themeProps, ...props };
};
