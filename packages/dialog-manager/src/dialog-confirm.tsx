"use client";

import type { TriggerDialogConfirm } from "./types";

import * as React from "react";
import { DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@tint-ui/dialog";
import { Button } from "@tint-ui/button";
import { useLayer } from "@tint-ui/theme";
import { useConfirm } from "./use-confirm";
import { useDialogText } from "./use-dialog-text";

const defaultText = { okButton: "OK", cancelButton: "Cancel", title: "Confirm" };

export interface DialogConfirmProps extends Omit<TriggerDialogConfirm, "message"> {
	message?: string;
	children?: React.ReactNode;
	onClosePrevent?: boolean;
}

export const DialogConfirm = (props: DialogConfirmProps) => {
	const { message, children } = props;
	const { locked, lockedType, onConfirm, onClose } = useConfirm(props);
	const { title, okButton, cancelButton } = useDialogText(["okButton", "cancelButton", "title"], props, defaultText);
	const layer = useLayer();
	return (
		<>
			<DialogHeader>
				<DialogTitle>{title}</DialogTitle>
				{message != null && message !== "" && <DialogDescription>{message}</DialogDescription>}
			</DialogHeader>
			{children}
			<DialogFooter>
				<Button
					data-id={layer.dataId("dialog-ok")}
					variant="primary"
					loading={locked && lockedType === "confirm"}
					disabled={locked}
					onClick={onConfirm}
					themePropsType="dialog.ok"
				>
					{okButton}
				</Button>
				<Button
					data-id={layer.dataId("dialog-cancel")}
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
