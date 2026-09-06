import type { ThemePropsType } from "@tint-ui/theme";

import { DATA_ATTRIBUTES, dataIdProps } from "./constant";

const componentLabelPropsType: ThemePropsType<{ id?: string }> = (props) => {
	return dataIdProps(props, DATA_ATTRIBUTES.INPUT_LABEL, "label", { required: false });
};

const componentLabelProps = {
	"component.form-input-group.label": componentLabelPropsType,
};

export { componentLabelProps, componentLabelPropsType };
