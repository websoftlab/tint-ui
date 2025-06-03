import type { TriggerDialogAlert } from "./types";

import { useTrigger } from "@tint-ui/trigger";
import { useDialog } from "./context";
import { dialogTriggerHandler } from "./dialog-trigger-handler";

const useAlert = (props: TriggerDialogAlert) => {
	const { cancelHandler, cancelTrigger } = props;
	const dialog = useDialog();
	const trigger = useTrigger();
	return {
		locked: dialog.locked,
		lockedType: dialog.lockedType,
		onClose() {
			return dialogTriggerHandler("alert", {
				dialog,
				service: trigger,
				trigger: cancelTrigger,
				handler: cancelHandler,
				lockedType: "close",
			});
		},
	};
};

export { useAlert };
