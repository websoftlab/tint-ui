import type { DialogManagerRegisterType } from "./types";

import { DialogAlert } from "./dialog-alert";

const registerType: DialogManagerRegisterType = {
	type: "alert",
	size: "sm",
	overlayClosable: false,
	component: DialogAlert,
};

export default registerType;
