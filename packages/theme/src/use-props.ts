import type { ThemePropsTypeOptions } from "./types";

import { useTheme } from "./use-theme";

export const useProps = function <T extends object, Attr extends object = object>(
	name: string,
	props: T & { themePropsType?: string },
	options: ThemePropsTypeOptions<Attr> = {} as ThemePropsTypeOptions<Attr>
): T {
	const theme = useTheme();
	let themeProps = theme.getProps<T>(name);
	let themePropsType: string | undefined | null = null;

	// Even an empty value!
	if ("themePropsType" in props) {
		const { themePropsType: type, ...rest } = props;
		themePropsType = type;
		props = rest as T;
	}

	if (themePropsType) {
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
