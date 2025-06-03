import type { ThemePropsType } from "@tint-ui/theme";

import { isEmptyString } from "@tint-ui/tools/is-empty";
import { DATA_ATTRIBUTES } from "./constant";

const componentButtonPropsType: ThemePropsType<{ [DATA_ATTRIBUTES.BUTTON]?: string }> = (props) => {
	const attrValue = props[DATA_ATTRIBUTES.BUTTON] ?? "button";
	if (isEmptyString(attrValue)) {
		return props;
	}
	return {
		[DATA_ATTRIBUTES.BUTTON]: attrValue,
		...props,
	};
};

const componentButtonProps = {
	"component.button": componentButtonPropsType,
	"component.input-select": componentButtonPropsType,
};

export { componentButtonProps, componentButtonPropsType };
