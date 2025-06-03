import type { DialogManagerRegisterType } from "./types";

import { DialogConfirm } from "./dialog-confirm";

const registerType: DialogManagerRegisterType = {
	type: "confirm",
	overlayClosable: false,
	escapeClosable: false,
	component: DialogConfirm,
};

export default registerType;
