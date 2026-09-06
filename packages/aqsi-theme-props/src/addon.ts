import type { ThemePropsType } from "@tint-ui/theme";

import { componentButtonPropsType } from "./button";
import { componentLabelPropsType } from "./label";

const componentAddonPropsType: ThemePropsType<{
	variant?: string;
	id?: string;
}> = (props, name, options) => {
	switch (props.variant) {
		case "button":
			return (componentButtonPropsType as Function)(props, name, options);
		case "label":
			return (componentLabelPropsType as Function)(props, name, options);
	}
	return props;
};

const componentAddonProps = {
	"component.input-addon": componentAddonPropsType,
};

export { componentAddonProps, componentAddonPropsType };
