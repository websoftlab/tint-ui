import type { Lexicon } from "./lexicon";

import { action, makeObservable, observable } from "mobx";
import { isPlainObject } from "@tint-ui/tools/is-plain-object";
import { LanguageStore } from "./lexicon";

/**
 * AppStoreOptions is a type that extends LanguageStoreOptions and adds a state property.
 */
interface AppStoreOptions extends Lexicon.LanguageStoreOptions {
	state?: any;
}

/**
 * AppStore is a class that extends LanguageStore and provides a way to manage the state of the application.
 * It allows you to set the initial state, update the state, and reload the state.
 */
class AppStore extends LanguageStore {
	public state: any;
	public readonly version: string = "1.0.0";
	public readonly build: string | null = null;

	private readonly initialState: any;
	private readonly additionalState: any;

	constructor({ state, ...rest }: AppStoreOptions = {}) {
		super(rest);

		if (!state) {
			state = {};
		} else {
			if (typeof state.buildVersion === "string") {
				this.version = state.buildVersion;
			}
			if (typeof state.buildId === "string") {
				this.build = state.buildId;
			}
		}

		this.state = state;
		this.initialState = state;
		this.additionalState = {};

		makeObservable(this, {
			state: observable,
			language: observable,
			lexicon: observable,
			lambda: observable,
			packages: observable,
			defaultReplacement: observable,
			setLanguageData: action,
			update: action,
			reload: action,
		});
	}

	/**
	 * Updates the state of the application.
	 *
	 * @param {any} state - The state to update.
	 */
	update(state: any) {
		if (isPlainObject(state)) {
			merge(this.additionalState, state);
			merge(this.state, this.additionalState);
		} else {
			throw new Error("Application state should be a plain object");
		}
	}

	/**
	 * Reloads the state of the application.
	 *
	 * @param {any} state - The state to reload.
	 * @param {boolean} init - Whether to initialize the state.
	 */
	reload(state: any, init: boolean = false) {
		if (isPlainObject(state)) {
			// update initial state
			if (init) {
				merge(this.initialState, state);
			}

			// fill initial state
			merge(this.state, this.initialState, true);
			if (!init) {
				merge(this.state, state);
			}

			// add additional state
			merge(this.state, this.additionalState);
		} else {
			throw new Error("Application state should be a plain object");
		}
	}
}

function merge(main: any, state: any, removeNotExists = false) {
	const keys = Object.keys(state);
	for (const key of keys) {
		const value = state[key];
		if (main[key] === value) {
			continue;
		}
		const isPlain = isPlainObject(value);
		if (main.hasOwnProperty(key) && isPlainObject(main[key]) && isPlain) {
			merge(main[key], value, removeNotExists);
		} else if (isPlain) {
			main[key] = { ...value };
		} else if (Array.isArray(value)) {
			main[key] = [...value];
		} else {
			main[key] = value;
		}
	}

	// remove not exists value
	if (removeNotExists) {
		for (const key of Object.keys(main)) {
			if (!keys.includes(key)) {
				delete main[key];
			}
		}
	}
}

export { AppStore };
export type { AppStoreOptions };
