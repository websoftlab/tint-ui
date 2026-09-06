import type { ThemePropsType } from "@tint-ui/theme";

import { DATA_ATTRIBUTES, dataIdProps } from "./constant";

const componentInputPropsType: ThemePropsType<{ id?: string; name?: string }> = (props) => {
	return dataIdProps(props, DATA_ATTRIBUTES.INPUT, "input", {
		required: false,
		alternativeProperty: "name",
	});
};

const componentInputProps = {
	"component.input-text": componentInputPropsType,
	"component.input-textarea": componentInputPropsType,
	"component.input-radio": componentInputPropsType,
	"component.input-checkbox": componentInputPropsType,
};

export { componentInputProps, componentInputPropsType };
