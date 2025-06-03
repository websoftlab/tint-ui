import type { DialogContextType } from "./types";
import type { TriggerProp, TriggerServiceImpl } from "@tint-ui/trigger";

import { logger } from "@tint-ui/tools/logger";

const dialogTriggerHandler = async (
	type: string,
	options: {
		dialog: DialogContextType;
		service: TriggerServiceImpl;
		trigger?: TriggerProp | undefined;
		handler?: (() => void | Promise<void>) | undefined;
		lockedType?: string;
	}
) => {
	const { dialog } = options;
	if (dialog.locked) {
		return;
	}
	const { service, trigger, handler, lockedType } = options;
	const complete = (err?: unknown) => {
		dialog.setLocked(false);
		if (err == null) {
			dialog.onClose();
		} else if (service.registered("toast")) {
			service.emit("toast", {
				id: `dialog-${type}`,
				level: "error",
				message: err instanceof Error ? err.message : String(err),
			});
		} else {
			logger.error(`Dialog ${type} failure`, err);
		}
	};
	dialog.setLocked(lockedType || true);
	try {
		if (typeof handler === "function") {
			await handler();
		}
		if (trigger) {
			await service.emitPropAsync(trigger);
		}
		complete();
	} catch (err) {
		complete(err);
	}
};

export { dialogTriggerHandler };
