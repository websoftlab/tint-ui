import type { AppStore } from "./app-store";

import * as React from "react";
import { useTrigger } from "@tint-ui/trigger";

/**
 * Singleton configuration for the trigger.
 */
const singleton = {
	limit: 1,
};

/**
 * React hook for registering app triggers.
 *
 * Triggers:
 * - `app.reload` - Reloads the app state.
 * - `app.update` - Updates the app state.
 * - `language` - Loads the language.
 * - `language.package` - Loads the language package.
 * - `language.reload` - Reloads current language and packages.
 *
 * @param app - The app store.
 * @param enabled - Whether the triggers are enabled.
 */
const useAppTrigger = (app: AppStore, enabled: boolean) => {
	const trigger = useTrigger();
	React.useEffect(() => {
		if (!enabled) {
			return;
		}
		return trigger.registerMany(
			{
				language: async ({ language }: { language: string }) => {
					if (language !== app.language) {
						await app.loadLanguage(language);
					}
				},
				"language.package": async ({ name }: { name: string }) => {
					if (!app.packages.includes(name)) {
						await app.loadLanguagePackage(name);
					}
				},
				"language.reload": async ({ language }: { language: string }) => {
					await app.reloadLanguage(language);
				},
				"app.reload": ({ state, init }: { state: any; init?: boolean }) => {
					app.reload(state, init);
				},
				"app.update": ({ state }: { state: any }) => {
					app.update(state);
				},
			},
			{
				language: singleton,
				"language.package": singleton,
				"language.reload": singleton,
			}
		);
	}, [app, enabled]);
};

export { useAppTrigger };
