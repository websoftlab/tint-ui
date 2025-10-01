"use client";

import type { ReactNode } from "react";
import type { TriggerServiceImpl } from "./types";

import * as React from "react";
import { useGlobalName } from "@tint-ui/tools/use-global-name";
import { TriggerService } from "./trigger-service";

const TriggerContext = React.createContext<TriggerServiceImpl | null>(null);

interface TriggerProviderProps {
	children: ReactNode;
	globalName?: string | boolean | null;
}

const TriggerProvider = ({ children, globalName }: TriggerProviderProps) => {
	const trigger = React.useMemo(() => new TriggerService(), []);
	useGlobalName(trigger, globalName, "__uiTrigger");
	return <TriggerContext.Provider value={trigger}>{children}</TriggerContext.Provider>;
};

const useTrigger = () => {
	const ctx = React.useContext(TriggerContext);
	if (!ctx) {
		throw new Error("TriggerContext is not defined");
	}
	return ctx;
};

TriggerProvider.displayName = "TriggerProvider";

export { TriggerProvider, TriggerContext, useTrigger };
export type { TriggerProviderProps };
