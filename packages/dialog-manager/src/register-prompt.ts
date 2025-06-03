import type { DialogManagerRegisterType } from "./types";

import { DialogPrompt } from "./dialog-prompt";

const registerType: DialogManagerRegisterType = {
	type: "prompt",
	overlayClosable: false,
	escapeClosable: false,
	component: DialogPrompt,
};

export default registerType;
