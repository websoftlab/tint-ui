import type { ThemePropsType } from "@tint-ui/theme";

import { DATA_ATTRIBUTES, dataIdProps } from "./constant";

const componentButtonPropsType: ThemePropsType<{
	id?: string;
}> = (props) => {
	return dataIdProps(props, DATA_ATTRIBUTES.BUTTON, "button");
};

const componentButtonProps = {
	"component.button": componentButtonPropsType,
	"component.input-select": componentButtonPropsType,
	"component.input-select.button-cancel": componentButtonPropsType,
	"component.table.sort": componentButtonPropsType,
};

export { componentButtonProps, componentButtonPropsType };
