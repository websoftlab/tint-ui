import type { TriggerDialogAlert } from "./types";

import { useTrigger } from "@tint-ui/trigger";
import { useDialog } from "./context";
import { dialogTriggerHandler } from "./dialog-trigger-handler";

const useAlert = (
	props: Pick<TriggerDialogAlert, "cancelTrigger" | "cancelHandler"> & { onClosePrevent?: boolean }
) => {
	const { cancelHandler, cancelTrigger, onClosePrevent } = props;
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
				onClosePrevent,
			});
		},
	};
};

export { useAlert };
