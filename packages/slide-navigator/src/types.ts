import * as React from "react";
import type { TriggerProp } from "@tint-ui/trigger";

export type SlideNavigatorApi = {
	readonly drag: boolean;
	readonly canBePrev: boolean;
	readonly canBeNext: boolean;
	readonly canBeDrag: boolean;
	readonly disabled: boolean;
	update(force?: boolean): void;
	goPrev(): void;
	goNext(): void;
};

export type SlideNavigatorOptions = {
	align?: "start" | "center" | "end";
	startIndex?: number;
	dragConfig?: {
		threshold?: number;
		friction?: number;
		multiplier?: number;
	};
};

export type SlideItemBuildType = {
	label: string;
	selected?: boolean;
	disabled?: boolean;
	onClick?: React.MouseEventHandler<HTMLButtonElement>;
	trigger?: TriggerProp;
};
