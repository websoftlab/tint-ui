"use client";

import type { DialogManagerRegisterType } from "./types";

import * as React from "react";
import * as Dialog from "@tint-ui/dialog";
import clsx from "clsx";
import { useDialogManagerClasses } from "./classes";
import { useCreateDialogManager } from "./use-create-dialog-manager";
import { DialogContextProvider } from "./context";

const preventCallback = (event: { preventDefault(): void }) => {
	event.preventDefault();
};

export interface DialogManagerProps extends React.HTMLAttributes<HTMLDivElement> {
	registerTypes?: DialogManagerRegisterType[];
	asyncForceDelay?: number;
}

export const DialogManager = React.forwardRef<HTMLDivElement, DialogManagerProps>(
	({ className, registerTypes, asyncForceDelay, ...rest }, ref) => {
		const classes = useDialogManagerClasses();
		const { open, manager, props, locked, onOpenChange } = useCreateDialogManager(
			registerTypes,
			typeof asyncForceDelay === "number" ? asyncForceDelay : 0
		);
		if (!manager) {
			return null;
		}
		const { context, component: As } = manager;
		let { escapeClosable, overlayClosable, size } = manager;
		if (locked) {
			escapeClosable = overlayClosable = false;
		}
		return (
			<Dialog.Dialog open={open} onOpenChange={onOpenChange}>
				<Dialog.DialogPortal>
					<Dialog.DialogOverlay className={clsx(classes.overlay)} />
					<div aria-modal="true" className={clsx(className, classes.dialogManager)} {...rest} ref={ref}>
						<Dialog.DialogContent
							className={clsx(classes.content, classes[size])}
							onInteractOutside={overlayClosable ? undefined : preventCallback}
							onEscapeKeyDown={escapeClosable ? undefined : preventCallback}
						>
							<DialogContextProvider value={context}>
								<As {...props} />
							</DialogContextProvider>
						</Dialog.DialogContent>
					</div>
				</Dialog.DialogPortal>
			</Dialog.Dialog>
		);
	}
);

DialogManager.displayName = "DialogManager";
