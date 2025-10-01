import type { AddFormFieldAdapter, AddFormFieldAdapterOptions } from "../types";

import { textAdapter, textAdapterOptions } from "./text";
import { selectAdapter, selectAdapterOptions } from "./select";
import { numberAdapter, numberAdapterOptions } from "./number";
import { passwordAdapter, passwordAdapterOptions } from "./password";
import { checkboxAdapter, checkboxAdapterOptions } from "./checkbox";

export const adapters: Record<string, { adapter: AddFormFieldAdapter; options: AddFormFieldAdapterOptions }> = {
	text: { adapter: textAdapter, options: textAdapterOptions },
	textarea: { adapter: textAdapter, options: textAdapterOptions },
	number: { adapter: numberAdapter, options: numberAdapterOptions },
	email: { adapter: textAdapter, options: textAdapterOptions },
	select: { adapter: selectAdapter, options: selectAdapterOptions },
	password: { adapter: passwordAdapter, options: passwordAdapterOptions },
	checkbox: { adapter: checkboxAdapter, options: checkboxAdapterOptions },
};
