import type { ThemePropsType } from "@tint-ui/theme";

import { DATA_ATTRIBUTES, dataIdProps } from "./constant";

const componentLinkPropsType: ThemePropsType<{ id?: string; name?: string }> = (props) => {
	return dataIdProps(props, DATA_ATTRIBUTES.NAV_LINK, "nab-link", { required: false });
};

const componentLinkProps = {
	"component.breadcrumb.link": componentLinkPropsType,
};

export { componentLinkProps, componentLinkPropsType };
