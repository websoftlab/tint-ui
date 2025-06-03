"use client";

import type { ReactNode } from "react";
import type { DialogContextType } from "./types";

import * as React from "react";

export const createDialogContext = (
	type: string,
	id: string,
	onClose: () => void,
	setLocked: (value: boolean | string) => void
): [() => void, DialogContextType] => {
	const closeCb = new Set<() => void>();
	const close = () => {
		const cbs = Array.from(closeCb.values());
		closeCb.clear();
		cbs.forEach((cb) => cb());
	};
	let locked: boolean | string = false;
	const context: DialogContextType = {
		get id() {
			return id;
		},
		get type() {
			return type;
		},
		get locked() {
			return locked !== false;
		},
		get lockedType() {
			return locked === false ? null : typeof locked === "string" ? locked : "request";
		},
		setLocked(value: boolean | string) {
			if (locked !== value) {
				locked = value;
				setLocked(value);
			}
		},
		onClose,
		onCloseSubscribe(cb: () => void): () => void {
			closeCb.add(cb);
			return () => {
				closeCb.delete(cb);
			};
		},
	};
	return [close, context];
};

const DialogContext = React.createContext<DialogContextType | null>(null);

export const DialogContextProvider = ({ value, children }: { value: DialogContextType; children: ReactNode }) => {
	return <DialogContext.Provider value={value}>{children}</DialogContext.Provider>;
};

export const useDialog = () => {
	const ctx = React.useContext(DialogContext);
	if (!ctx) {
		throw new Error("Dialog context is not defined");
	}
	return ctx;
};
