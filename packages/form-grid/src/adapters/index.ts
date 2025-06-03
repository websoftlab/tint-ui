import type { AddFormFieldAdapter, AddFormFieldAdapterOptions } from "../types";

import { textAdapter, textAdapterOptions } from "./text";
import { selectAdapter, selectAdapterOptions } from "./select";
import { numberAdapter, numberAdapterOptions } from "./number";
import { passwordAdapter, passwordAdapterOptions } from "./password";
import { checkboxAdapter, checkboxAdapterOptions } from "./checkbox";

export const adapters: Record<string, [AddFormFieldAdapter, AddFormFieldAdapterOptions]> = {
	text: [textAdapter, textAdapterOptions],
	textarea: [textAdapter, textAdapterOptions],
	email: [textAdapter, textAdapterOptions],
	number: [numberAdapter, numberAdapterOptions],
	select: [selectAdapter, selectAdapterOptions],
	password: [passwordAdapter, passwordAdapterOptions],
	checkbox: [checkboxAdapter, checkboxAdapterOptions],
};
