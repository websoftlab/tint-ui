import type { TriggerDialogConfirm } from "./types";

import { useTrigger } from "@tint-ui/trigger";
import { useDialog } from "./context";
import { dialogTriggerHandler } from "./dialog-trigger-handler";

const useConfirm = (props: TriggerDialogConfirm) => {
	const { cancelHandler, cancelTrigger, confirmHandler, confirmTrigger } = props;
	const dialog = useDialog();
	const trigger = useTrigger();
	return {
		locked: dialog.locked,
		lockedType: dialog.lockedType,
		onClose() {
			return dialogTriggerHandler("confirm", {
				dialog,
				service: trigger,
				trigger: cancelTrigger,
				handler: cancelHandler,
				lockedType: "close",
			});
		},
		onConfirm() {
			return dialogTriggerHandler("confirm", {
				dialog,
				service: trigger,
				trigger: confirmTrigger,
				handler: confirmHandler,
				lockedType: "confirm",
			});
		},
	};
};

export { useConfirm };
