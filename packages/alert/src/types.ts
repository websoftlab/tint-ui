import type { ReactNode } from "react";

export type AlertVariant = "default" | "primary" | "secondary" | "destructive";

export type AlertBuilderSchema = {
	title?: string;
	icon?: string;
	description: string | string[] | ReactNode;
};
