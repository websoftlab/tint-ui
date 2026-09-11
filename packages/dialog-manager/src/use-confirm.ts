import type { TriggerDialogConfirm } from "./types";

import { useTrigger } from "@tint-ui/trigger";
import { useDialog } from "./context";
import { dialogTriggerHandler } from "./dialog-trigger-handler";

const useConfirm = (
	props: Pick<TriggerDialogConfirm, "cancelHandler" | "cancelTrigger" | "confirmHandler" | "confirmTrigger"> & {
		onClosePrevent?: boolean;
	}
) => {
	const { cancelHandler, cancelTrigger, confirmHandler, confirmTrigger, onClosePrevent } = props;
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
				onClosePrevent,
			});
		},
		onConfirm() {
			return dialogTriggerHandler("confirm", {
				dialog,
				service: trigger,
				trigger: confirmTrigger,
				handler: confirmHandler,
				lockedType: "confirm",
				onClosePrevent,
			});
		},
	};
};

export { useConfirm };
