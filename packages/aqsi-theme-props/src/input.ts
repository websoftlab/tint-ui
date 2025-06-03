import type { ThemePropsType } from "@tint-ui/theme";

import { isEmptyString } from "@tint-ui/tools/is-empty";
import { DATA_ATTRIBUTES } from "./constant";

const componentInputPropsType: ThemePropsType<{ name?: string }> = (props) => {
	const { name } = props;
	if (DATA_ATTRIBUTES.INPUT in props || isEmptyString(name)) {
		return props;
	}
	return {
		[DATA_ATTRIBUTES.INPUT]: name,
		...props,
	};
};

const componentInputProps = {
	"component.input-text": componentInputPropsType,
	"component.input-textarea": componentInputPropsType,
	"component.input-radio": componentInputPropsType,
	"component.input-checkbox": componentInputPropsType,
};

export { componentInputProps, componentInputPropsType };
