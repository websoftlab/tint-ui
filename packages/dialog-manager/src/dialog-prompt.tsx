"use client";

import type { TriggerDialogPrompt } from "./types";

import * as React from "react";
import { DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@tint-ui/dialog";
import { Button } from "@tint-ui/button";
import { InputText, InputTextarea } from "@tint-ui/input";
import { useLayer } from "@tint-ui/theme";
import { usePrompt } from "./use-prompt";
import { useDialogText } from "./use-dialog-text";

const defaultText = { okButton: "OK", cancelButton: "Cancel", title: "Prompt" };

export interface DialogPromptProps extends Omit<TriggerDialogPrompt, "message"> {
	message?: string;
	children?: React.ReactNode;
}

export const DialogPrompt = (props: DialogPromptProps) => {
	const { message, multiline, children } = props;
	const { locked, text, onSubmit, onChange, onClose } = usePrompt(props);
	const { title, okButton, cancelButton } = useDialogText(["okButton", "cancelButton", "title"], props, defaultText);
	const Input = multiline ? InputTextarea : InputText;
	const id = React.useId();
	const layer = useLayer();
	return (
		<>
			<DialogHeader>
				<DialogTitle>{title}</DialogTitle>
				{message != null && message !== "" && <DialogDescription>{message}</DialogDescription>}
			</DialogHeader>
			<form id={id} onSubmit={onSubmit}>
				<Input disabled={locked} value={text} onChange={onChange} />
			</form>
			{children}
			<DialogFooter>
				<Button
					data-id={layer.dataId("dialog-ok")}
					variant="primary"
					type="submit"
					form={id}
					disabled={text.trim().length === 0}
					loading={locked}
					themePropsType="dialog.ok"
				>
					{okButton}
				</Button>
				<Button
					data-id={layer.dataId("dialog-cancel")}
					variant="outline"
					autoFocus
					disabled={locked}
					onClick={onClose}
					themePropsType="dialog.cancel"
				>
					{cancelButton}
				</Button>
			</DialogFooter>
		</>
	);
};
