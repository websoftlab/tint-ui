"use client";

import type { TriggerDialogConfirm } from "./types";

import * as React from "react";
import { DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@tint-ui/dialog";
import { Button } from "@tint-ui/button";
import { useConfirm } from "./use-confirm";
import { useDialogText } from "./use-dialog-text";

const defaultText = { okButton: "OK", cancelButton: "Cancel", title: "Confirm" };

export const DialogConfirm = (props: TriggerDialogConfirm) => {
	const { message } = props;
	const { locked, lockedType, onConfirm, onClose } = useConfirm(props);
	const { title, okButton, cancelButton } = useDialogText(["okButton", "cancelButton", "title"], props, defaultText);
	return (
		<>
			<DialogHeader>
				<DialogTitle>{title}</DialogTitle>
				<DialogDescription>{message}</DialogDescription>
			</DialogHeader>
			<DialogFooter>
				<Button
					variant="primary"
					loading={locked && lockedType === "confirm"}
					disabled={locked}
					onClick={onConfirm}
					themePropsType="dialog.ok"
				>
					{okButton}
				</Button>
				<Button
					variant="outline"
					autoFocus
					loading={locked && lockedType === "close"}
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
