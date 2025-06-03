import type { ExternalToast } from "sonner";
import type { TriggerProp } from "@tint-ui/trigger";
import type { ReactNode } from "react";

export type ToastLevel = "default" | "info" | "error" | "success" | "warning";

export interface ToastLoader {
	isCompleted: boolean;
	complete: null | (() => void);
}

export type ToastAction = { label: string; handler: () => void } | { label: string; trigger: TriggerProp };

export interface TriggerToastProps extends Pick<ExternalToast, "description" | "closeButton" | "duration" | "id"> {
	message: (() => ReactNode) | ReactNode;
	level?: ToastLevel;
	loader?: ToastLoader;
	action?: ToastAction;
}

export interface TriggerToastCloseProps extends Pick<ExternalToast, "id"> {}
