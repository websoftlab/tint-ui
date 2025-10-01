"use client";

import type { ReactNode } from "react";
import type { AppStoreOptions } from "./app-store";

import * as React from "react";
import { useGlobalName } from "@tint-ui/tools/use-global-name";
import { AppStore } from "./app-store";
import { useAppTrigger } from "./use-app-trigger";

const AppContext = React.createContext<null | AppStore>(null);

const AppMountContext = React.createContext<null | MountContext>(null);

const useMountContext = (): MountContext => {
	const { onMount, ...ctx } = React.useMemo(() => {
		let mount = false;
		const listeners = new Set<() => void>();
		return {
			get mount() {
				return mount;
			},
			onMount() {
				mount = true;
				for (const cb of listeners.values()) {
					cb();
				}
				listeners.clear();
				return () => {
					mount = false;
				};
			},
			subscribe(cb: () => void) {
				if (mount) {
					return () => {};
				}
				listeners.add(cb);
				return () => {
					listeners.delete(cb);
				};
			},
		};
	}, []);
	React.useEffect(onMount, [onMount]);
	return ctx;
};

interface MountContext {
	readonly mount: boolean;
	subscribe(cb: () => void): () => void;
}

interface AppProviderProps {
	children: ReactNode;
	options?: AppStoreOptions;
	useTrigger?: boolean;
	globalName?: string | boolean;
}

/**
 * AppProvider is a component that provides the AppStore to its children.
 *
 * @param {AppProviderProps} props - The props for the AppProvider.
 * @returns {React.ReactNode} The AppProvider component.
 */
const AppProvider = ({ children, options, globalName, useTrigger = true }: AppProviderProps): React.ReactNode => {
	const app = React.useMemo(() => new AppStore(options), []);
	const mount = useMountContext();
	useGlobalName(app, globalName, "__uiApp");
	useAppTrigger(app, useTrigger);
	return (
		<AppContext.Provider value={app}>
			<AppMountContext.Provider value={mount}>{children}</AppMountContext.Provider>
		</AppContext.Provider>
	);
};

export { AppContext, AppMountContext, AppProvider };
export type { AppProviderProps };
