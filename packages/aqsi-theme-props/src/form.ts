import type { ThemePropsType } from "@tint-ui/theme";

import { DATA_ATTRIBUTES, dataIdProps } from "./constant";

const componentFormPropsType: ThemePropsType<{
	id?: string;
}> = (props) => {
	return dataIdProps(props, DATA_ATTRIBUTES.FORM, "form", { required: false });
};

const componentFormProps = {
	"component.form-grid": componentFormPropsType,
};

export { componentFormProps, componentFormPropsType };
