import type { TriggerDialogPrompt } from "./types";
import type { ChangeEvent, FormEvent } from "react";

import * as React from "react";
import { createTriggerProp, useTrigger } from "@tint-ui/trigger";
import { useDialog } from "./context";
import { dialogTriggerHandler } from "./dialog-trigger-handler";

const usePrompt = (props: TriggerDialogPrompt) => {
	const { initialMessage = "" } = props;
	const [text, setText] = React.useState(initialMessage);
	const ref = React.useRef(props);
	const dialog = useDialog();
	const trigger = useTrigger();
	ref.current = props;
	const memo = React.useMemo(() => {
		let inputText = text;
		return {
			onChange(event: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>) {
				if (!dialog.locked) {
					inputText = event.target.value;
					setText(inputText);
				}
			},
			async onSubmit(event: FormEvent) {
				event.preventDefault();
				if (dialog.locked) {
					return;
				}
				const message = inputText.trim();
				if (!message.length) {
					return;
				}
				const { confirmHandler, confirmTrigger } = ref.current;
				let triggerMerge = confirmTrigger;
				if (confirmTrigger) {
					const { name, props } = createTriggerProp(confirmTrigger);
					triggerMerge = { name, props: { ...props, message } };
				}
				return dialogTriggerHandler("prompt", {
					dialog,
					service: trigger,
					lockedType: "submit",
					trigger: triggerMerge,
					handler: () => {
						if (typeof confirmHandler === "function") {
							return confirmHandler(message);
						}
					},
				});
			},
			onClose() {
				const { cancelHandler, cancelTrigger } = ref.current;
				return dialogTriggerHandler("prompt", {
					dialog,
					service: trigger,
					trigger: cancelTrigger,
					handler: cancelHandler,
					lockedType: "close",
				});
			},
		};
	}, [dialog, trigger, setText, ref]);
	return {
		locked: dialog.locked,
		lockedType: dialog.lockedType,
		text,
		...memo,
	};
};

export { usePrompt };
