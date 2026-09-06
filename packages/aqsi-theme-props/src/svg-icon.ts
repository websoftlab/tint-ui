import type { ThemePropsType } from "@tint-ui/theme";

import { isEmptyString } from "@tint-ui/tools/is-empty";
import { DATA_ATTRIBUTES, findDataId } from "./constant";

const componentSvgIconPropsType: ThemePropsType<{ id?: string }, { name?: string }> = (props, _, options) => {
	const dataId = findDataId(props);
	if (dataId) {
		return {
			[DATA_ATTRIBUTES.ICON]: `icon--${dataId.value}`,
			...props,
		};
	}

	if (DATA_ATTRIBUTES.ICON in props) {
		return props;
	}

	let attrValue: string;

	const { name } = options;
	if (!isEmptyString(name)) {
		attrValue = `icon-name-${name}`;
	} else {
		const { id } = props;
		if (id) {
			attrValue = `icon-id-${id}`;
		} else {
			return props;
		}
	}

	return {
		[DATA_ATTRIBUTES.ICON]: attrValue,
		...props,
	};
};

const componentSvgIconProps = {
	"component.svg-icon": componentSvgIconPropsType,
};

export { componentSvgIconProps, componentSvgIconPropsType };
