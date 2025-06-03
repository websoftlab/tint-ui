import type { Lexicon } from "./types";

import { logger } from "@tint-ui/tools/logger";
import { mergeData } from "./merge-data";

let defaultLanguageId = "en";

const lexicons: Record<string, () => Promise<Lexicon.InputData>> = {};
const lexiconPackages: Record<string, Record<string, () => Promise<{ default: Lexicon.InputDict }>>> = {};
const lexiconData: Record<string, Lexicon.Data> = {};
const listeners: Lexicon.Listener[] = [];

/**
 * Sets the default language id.
 *
 * @param {string} id - The id of the default language.
 */
export function setDefaultLanguageId(id: string) {
	defaultLanguageId = id;
	if (Object.keys(lexiconData).length > 0) {
		logger.error("Warning! Assigned default language id after initialized");
	}
}

/**
 * Registers a lexicon with a loader and packages.
 *
 * @param {string} id - The id of the lexicon.
 * @param {() => Promise<Lexicon.InputData>} loader - The loader function for the lexicon.
 * @param {Record<string, () => Promise<{ default: Lexicon.InputDict }>>} packages - The packages for the lexicon.
 */
export function register(
	id: string,
	loader: () => Promise<Lexicon.InputData>,
	packages: Record<string, () => Promise<{ default: Lexicon.InputDict }>> = {}
) {
	lexicons[id] = loader;
	lexiconPackages[id] = packages;
}

/**
 * Checks if a lexicon is loaded.
 *
 * @param {string} id - The id of the lexicon.
 * @param {string} packageName - The name of the package.
 * @returns {boolean} True if the lexicon is loaded, false otherwise.
 */
export function loaded(id: string, packageName?: string): boolean {
	if (!lexiconData.hasOwnProperty(id)) {
		return false;
	}
	if (packageName) {
		return lexiconData[id].packages.includes(packageName);
	}
	return true;
}

/**
 * Subscribes a listener to the lexicon.
 *
 * @param {Lexicon.Listener} listener - The listener to subscribe.
 * @returns {() => void} The unsubscribe function.
 */
export function subscribe(listener: Lexicon.Listener): () => void {
	if (typeof listener === "function" && !listeners.includes(listener)) {
		listeners.push(listener);
	}
	return () => {
		const index = listeners.indexOf(listener);
		if (index !== -1) {
			listeners.splice(index, 1);
		}
	};
}

async function trigger(data: Lexicon.Data, packageName: string | null = null): Promise<Lexicon.Data> {
	if (!listeners.length) {
		return data;
	}
	const copy = listeners.slice();
	const event = Object.assign({}, data, { packageName });
	for (let i = 0; i < copy.length; i++) {
		const listener = copy[i];
		try {
			await listener(event);
		} catch (err) {
			logger.error("Lexicon listener failure", err);
		}
	}
	return data;
}

/**
 * Loads a lexicon with a package.
 *
 * @param {string} id - The id of the lexicon.
 * @param {string} packageName - The name of the package.
 * @returns {Promise<Lexicon.Data>} The loaded lexicon data.
 */
export async function load(id: string, packageName?: string | null): Promise<Lexicon.Data> {
	if (typeof packageName !== "string" || packageName.length < 1) {
		packageName = null;
	}

	if (!lexicons[id]) {
		id = defaultLanguageId;
		if (!lexicons[id]) {
			return trigger({
				id,
				lambda: {},
				lexicon: {},
				packages: [],
			});
		}
	}

	let data = lexiconData[id];
	if (data && (!packageName || data.packages.includes(packageName))) {
		return data;
	}

	if (!data) {
		const { lexicon, ...rest } = await lexicons[id]();
		data = {
			...rest,
			lexicon: mergeData(lexicon),
			packages: [],
		};
		data = await trigger(data, null);
	}

	if (packageName && !data.packages.includes(packageName)) {
		const pg = lexiconPackages[id];
		if (pg.hasOwnProperty(packageName)) {
			const add = await pg[packageName]();
			Object.assign(data.lexicon, mergeData((add && add.default) || {}, packageName));
		}
		data.packages.push(packageName);
		data = await trigger(data, packageName);
	}

	lexiconData[id] = data;
	return data;
}

/**
 * Reloads a lexicon with all packages.
 *
 * @param {string} id - The id of the lexicon.
 * @returns {Promise<Lexicon.Data>} The reloaded lexicon data.
 */
export async function reload(id: string): Promise<Lexicon.Data> {
	let packages: string[] = [];
	if (loaded(id)) {
		packages = lexiconData[id].packages.slice();
		delete lexiconData[id];
	}
	let data = await load(id);
	for (let packageName of packages) {
		data = await load(id, packageName);
	}
	return data;
}

/**
 * Reloads all lexicons with all packages.
 *
 * @returns {Promise<Record<string, Lexicon.Data>>} The reloaded lexicon data.
 */
export async function reloadAll(): Promise<Record<string, Lexicon.Data>> {
	const data: Record<string, Lexicon.Data> = {};
	for (const id of Object.keys(lexiconData)) {
		data[id] = await reload(id);
	}
	return data;
}

/**
 * Loads the lambda functions for a lexicon.
 *
 * @param {string} id - The id of the lexicon.
 * @returns {Promise<Record<string, Lexicon.LambdaTranslate>>} The lambda functions.
 */
export async function loadLambda(id: string): Promise<Record<string, Lexicon.LambdaTranslate>> {
	return (await load(id)).lambda;
}

/**
 * Loads the lexicon for a lexicon.
 *
 * @param {string} id - The id of the lexicon.
 * @returns {Promise<Lexicon.Dict>} The lexicon.
 */
export async function loadLexicon(id: string): Promise<Lexicon.Dict> {
	return (await load(id)).lexicon;
}
