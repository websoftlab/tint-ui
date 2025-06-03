import type { ThemePropsType } from "@tint-ui/theme";

import { isEmptyString } from "@tint-ui/tools/is-empty";
import { DATA_ATTRIBUTES } from "./constant";

const componentSvgIconPropsType: ThemePropsType<{ [DATA_ATTRIBUTES.ICON]?: string }, { name?: string }> = (
	props,
	_name,
	options
) => {
	const { name } = options;
	if (DATA_ATTRIBUTES.ICON in props || isEmptyString(name)) {
		return props;
	}
	return {
		[DATA_ATTRIBUTES.ICON]: name,
		...props,
	};
};

const componentSvgIconProps = {
	"component.svg-icon": componentSvgIconPropsType,
};

export { componentSvgIconProps, componentSvgIconPropsType };
