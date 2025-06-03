import type { TriggerProp } from "@tint-ui/trigger";

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

export type AvatarBadgeType = "default" | "destructive";

export interface AvatarBuilderSchema {
	trigger?: TriggerProp;
	badge?: boolean | AvatarBadgeType | null | undefined;
	icon?: boolean | string | null | undefined;
	image?: string;
	fallback?: string;
	colorize?: boolean;
}
