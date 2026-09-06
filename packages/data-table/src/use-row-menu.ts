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
	return (
		item: Pick<RowMenuOption<TData>, "trigger" | "onClick" | "disabledKey" | "confirmation" | "triggerKey">
	) => {
		const { onClick, trigger, triggerKey, confirmation, disabledKey } = item;
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
		let disabled = false;
		if (disabledKey) {
			disabled = data[disabledKey as keyof TData] === true;
		} else if (triggerKey && !trigger && !onClick && data[triggerKey] == null) {
			disabled = true;
		}
		return {
			disabled,
			getLabel(label: string) {
				return label.includes("{{") ? app.replace(label, data) : label;
			},
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
