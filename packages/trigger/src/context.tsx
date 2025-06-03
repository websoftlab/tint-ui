"use client";

import type { ReactNode } from "react";
import type { TriggerServiceImpl } from "./types";

import * as React from "react";
import { TriggerService } from "./trigger-service";

const TriggerContext = React.createContext<TriggerServiceImpl | null>(null);

interface TriggerProviderProps {
	children: ReactNode;
}

const TriggerProvider = (props: TriggerProviderProps) => {
	const trigger = React.useMemo(() => new TriggerService(), []);
	return <TriggerContext.Provider value={trigger} {...props} />;
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
