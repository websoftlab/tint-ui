import type { ElementType } from "react";
import type { TriggerProp } from "@tint-ui/trigger";

interface DialogManagerOptions {
	type: string;
	component: ElementType;
	overlayClosable?: boolean;
	escapeClosable?: boolean;
	size?: DialogManagerSizeType;
}

export type DialogManagerSizeType = "sm" | "md" | "lg" | "xl" | "xxl";

export interface TriggerDialogManagerProps<P = any> extends DialogManagerOptions {
	id: string;
	props: P;
}

export interface TriggerDialogAlert {
	title?: string;
	okButton?: string;
	cancelTrigger?: TriggerProp;
	cancelHandler?: () => void | Promise<void>;
	message: string;
}

export interface TriggerDialogConfirm extends TriggerDialogAlert {
	cancelButton?: string;
	confirmTrigger?: TriggerProp;
	confirmHandler?: () => void | Promise<void>;
}

export interface TriggerDialogPrompt extends TriggerDialogAlert {
	cancelButton?: string;
	multiline?: boolean;
	initialMessage?: string;
	confirmTrigger?: TriggerProp;
	confirmHandler?: (message: string) => void | Promise<void>;
}

export interface DialogContextType {
	readonly id: string;
	readonly type: string;
	readonly locked: boolean;
	readonly lockedType: string | null;

	onClose(): void;

	onCloseSubscribe(cb: () => void): () => void;

	setLocked(value: boolean | string): void;
}

export interface DialogManagerRegisterType<T = any> extends DialogManagerOptions {
	detail?: T;
}
