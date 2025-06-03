"use client";

import type { TriggerDialogAlert } from "./types";

import * as React from "react";
import { DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@tint-ui/dialog";
import { Button } from "@tint-ui/button";
import { useDialogText } from "./use-dialog-text";
import { useAlert } from "./use-alert";

const defaultText = { okButton: "OK", title: "Alert" };

export const DialogAlert = (props: TriggerDialogAlert) => {
	const { message } = props;
	const { onClose, locked, lockedType } = useAlert(props);
	const { title, okButton } = useDialogText(["okButton", "title"], props, defaultText);
	return (
		<>
			<DialogHeader>
				<DialogTitle>{title}</DialogTitle>
				<DialogDescription>{message}</DialogDescription>
			</DialogHeader>
			<DialogFooter>
				<Button
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
