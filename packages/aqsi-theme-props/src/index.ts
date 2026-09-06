import { componentButtonProps } from "./button";
import { componentFormProps } from "./form";
import { componentInputProps } from "./input";
import { componentLabelProps } from "./label";
import { componentTableProps } from "./table";
import { componentAddonProps } from "./addon";
import { componentSvgIconProps } from "./svg-icon";
import { componentLinkProps } from "./link";

const props = {
	...componentButtonProps,
	...componentFormProps,
	...componentInputProps,
	...componentSvgIconProps,
	...componentLabelProps,
	...componentTableProps,
	...componentAddonProps,
	...componentLinkProps,
};

export { props };
