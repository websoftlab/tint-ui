import type { DialogManagerRegisterType } from "./types";

import alert from "./register-alert";
import confirm from "./register-confirm";
import prompt from "./register-prompt";

const registerTypes: DialogManagerRegisterType[] = [alert, confirm, prompt];

export default registerTypes;
