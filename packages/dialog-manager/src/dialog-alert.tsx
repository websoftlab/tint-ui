"use client";

import type { TriggerDialogAlert } from "./types";

import * as React from "react";
import { DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@tint-ui/dialog";
import { Button } from "@tint-ui/button";
import { useLayer } from "@tint-ui/theme";
import { useDialogText } from "./use-dialog-text";
import { useAlert } from "./use-alert";

const defaultText = { okButton: "OK", title: "Alert" };

export interface DialogAlertProps extends Omit<TriggerDialogAlert, "message"> {
	message?: string;
	children?: React.ReactNode;
	onClosePrevent?: boolean;
}

export const DialogAlert = (props: DialogAlertProps) => {
	const { message, children } = props;
	const { onClose, locked, lockedType } = useAlert(props);
	const { title, okButton } = useDialogText(["okButton", "title"], props, defaultText);
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
					loading={locked && lockedType === "close"}
					disabled={locked}
					onClick={onClose}
					autoFocus
					themePropsType="dialog.ok"
				>
					{okButton}
				</Button>
			</DialogFooter>
		</>
	);
};
