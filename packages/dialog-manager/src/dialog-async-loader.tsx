"use client";

import type { DialogManagerAsyncLoader } from "./types";

import * as React from "react";
import { DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@tint-ui/dialog";
import { Button } from "@tint-ui/button";
import { errorMessage } from "@tint-ui/tools/error-message";
import { useDialogText } from "./use-dialog-text";
import { useDialog } from "./context";

type DialogAsyncLoaderProps = {
	loader: DialogManagerAsyncLoader;
	onLoad: (component: React.ElementType) => void;
	originProps: object;
	asyncForceDelay: number;
};

const dataAttribute = "data-dialog-loading";
const defaultText = {
	title: "Loading",
	cancelButton: "Cancel",
	reloadButton: "Try again",
	failed: "Failed to load dialog",
	loading: "Please wait, the dialog is loading...",
};

const DialogAsyncLoader = (props: DialogAsyncLoaderProps) => {
	const { loader, onLoad, asyncForceDelay } = props;
	const dialog = useDialog();
	const [Proxy, setProxy] = React.useState<{ Component: React.ElementType } | null>(null);
	const [error, setError] = React.useState<{ message: string } | null>(null);
	const { title, loading, failed, cancelButton, reloadButton } = useDialogText(
		["title", "cancelButton", "reloadButton", "failed", "loading"],
		{},
		defaultText
	);

	const loaderRef = React.useRef<null | ((reload?: boolean) => void)>(null);
	const reloadHandler = () => {
		if (Proxy == null && !dialog.locked && loaderRef.current) {
			loaderRef.current(true);
		}
	};

	React.useEffect(() => {
		let mount = true;
		const mId = Math.random().toString(36).substring(2);
		const doc = typeof document !== "undefined" ? document.documentElement : null;
		const reset = () => {
			if (!doc) {
				return;
			}
			const rId = doc.getAttribute(dataAttribute);
			if (rId === mId) {
				doc.removeAttribute(dataAttribute);
			}
		};
		loaderRef.current = (reload = false) => {
			if (doc) {
				doc.setAttribute(dataAttribute, mId);
			}
			if (reload) {
				setError(null);
			}
			const start = Date.now();
			const done = (Component: React.ElementType) => {
				if (mount) {
					setProxy({ Component });
				}
				reset();
				onLoad(Component);
			};
			dialog.setLocked("loading");
			loader()
				.then(({ default: component }) => {
					const delta = Date.now() - start;
					if (delta < asyncForceDelay) {
						setTimeout(() => {
							done(component);
						}, asyncForceDelay - delta);
					} else {
						done(component);
					}
				})
				.catch((err) => {
					if (mount) {
						setError(errorMessage(err));
					}
				})
				.finally(() => {
					dialog.setLocked(false);
				});
		};
		loaderRef.current();
		return () => {
			mount = false;
			loaderRef.current = null;
			reset();
		};
	}, [dialog, asyncForceDelay, loader, onLoad]);

	if (Proxy != null) {
		return <Proxy.Component {...props.originProps} />;
	}

	const { locked, lockedType, onClose } = dialog;
	if (error != null) {
		return (
			<>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>{`${failed}: ${error.message}`}</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button
						variant="primary"
						loading={locked && lockedType === "loading"}
						disabled={locked}
						onClick={reloadHandler}
						themePropsType="dialog.reload"
					>
						{reloadButton}
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
	}

	return (
		<DialogHeader>
			<DialogTitle>{title}</DialogTitle>
			<DialogDescription>{loading}</DialogDescription>
		</DialogHeader>
	);
};

DialogAsyncLoader.displayName = "DialogAsyncLoader";

export { DialogAsyncLoader };
