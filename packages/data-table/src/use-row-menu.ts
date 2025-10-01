"use client";

import type { CellContext } from "@tanstack/react-table";
import type { RowMenuOption } from "./types";
import type { TriggerDialogConfirm } from "@tint-ui/dialog-manager";

import { useTrigger, createTriggerProp } from "@tint-ui/trigger";
import { useApp } from "@tint-ui/app";

const useRowMenu = <TData>(info: CellContext<TData, unknown>) => {
	const app = useApp();
	const triggerService = useTrigger();
	const data: TData = info.row.original;
	return (item: Pick<RowMenuOption<TData>, "trigger" | "onClick" | "enabledKey" | "confirmation" | "triggerKey">) => {
		const { onClick, trigger, triggerKey, confirmation, enabledKey } = item;
		const clickHandler = () => {
			if (typeof onClick === "function") {
				onClick(data);
			}
			if (triggerKey) {
				const triggerProp = data[triggerKey];
				if (triggerProp != null) {
					triggerService.emitProp(createTriggerProp(triggerProp as string));
				}
			}
			if (trigger) {
				const { name, props } = createTriggerProp(trigger);
				triggerService.emit(name, "data" in props ? props : { ...props, data });
			}
		};
		return {
			disabled: enabledKey ? data[enabledKey as keyof TData] === true : false,
			onClick() {
				if (confirmation) {
					const message = app.replace(confirmation, data);
					if (triggerService.registered("dialog:confirm")) {
						triggerService.emit<TriggerDialogConfirm>("dialog:confirm", {
							message,
							confirmHandler: clickHandler,
						});
					} else if (window.confirm(message)) {
						clickHandler();
					}
				} else {
					clickHandler();
				}
			},
		};
	};
};

export { useRowMenu };
