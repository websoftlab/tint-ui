"use client";

import type { ExternalToast } from "sonner";
import type { TriggerServiceImpl } from "@tint-ui/trigger";
import type { TriggerToastProps } from "./types";

import { toast } from "sonner";

const toastTrigger = (service: TriggerServiceImpl, props: TriggerToastProps) => {
	const { message, loader, level = "default", action, ...rest } = props;
	const external: ExternalToast = { ...rest };

	if (action) {
		external.action = {
			label: action.label,
			onClick() {
				if ("handler" in action) {
					action.handler();
				} else {
					service.emitProp(action.trigger);
				}
			},
		};
	}

	if (loader) {
		const text = typeof message === "function" ? message() : message;
		const promise = new Promise<void>((resolve) => {
			if (loader.isCompleted) {
				resolve();
			} else {
				loader.complete = resolve;
			}
		});
		toast.promise(promise, {
			...external,
			closeButton: false,
			loading: text,
		});
		return promise;
	} else {
		switch (level) {
			case "error":
			case "success":
			case "info":
			case "warning":
				toast[level](message, external);
				break;
			default:
				toast(message, external);
				break;
		}
	}
};

export { toastTrigger };
