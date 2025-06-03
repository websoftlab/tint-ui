"use client";

import type { TriggerDialogPrompt } from "./types";

import * as React from "react";
import { DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@tint-ui/dialog";
import { Button } from "@tint-ui/button";
import { usePrompt } from "./use-prompt";
import { useDialogText } from "./use-dialog-text";
import { InputText, InputTextarea } from "@tint-ui/input";

const defaultText = { okButton: "OK", cancelButton: "Cancel", title: "Prompt" };

export const DialogPrompt = (props: TriggerDialogPrompt) => {
	const { message, multiline } = props;
	const { locked, text, onSubmit, onChange, onClose } = usePrompt(props);
	const { title, okButton, cancelButton } = useDialogText(["okButton", "cancelButton", "title"], props, defaultText);
	const Input = multiline ? InputTextarea : InputText;
	const id = React.useId();
	return (
		<>
			<DialogHeader>
				<DialogTitle>{title}</DialogTitle>
				<DialogDescription>{message}</DialogDescription>
			</DialogHeader>
			<form id={id} onSubmit={onSubmit}>
				<Input disabled={locked} value={text} onChange={onChange} />
			</form>
			<DialogFooter>
				<Button
					variant="primary"
					type="submit"
					form={id}
					disabled={text.trim().length === 0}
					loading={locked}
					themePropsType="dialog.ok"
				>
					{okButton}
				</Button>
				<Button variant="outline" autoFocus disabled={locked} onClick={onClose} themePropsType="dialog.cancel">
					{cancelButton}
				</Button>
			</DialogFooter>
		</>
	);
};
