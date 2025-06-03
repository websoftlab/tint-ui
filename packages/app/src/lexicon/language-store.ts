import type { Lexicon } from "./types";
import type { LexiconEntryResponse } from "./parser";

import { reload, load } from "./lexicon";
import { mergeData } from "./merge-data";
import { format, replace } from "./format";
import { plurals } from "./plurals";
import { Formatter } from "./formatter";

/**
 * Language store for managing translations.
 */
export class LanguageStore implements Lexicon.LanguageStoreInterface {
	/**
	 * The current language.
	 */
	public language: string = "en";
	public lexicon: Lexicon.Dict = {};
	public lambda: Record<string, Lexicon.LambdaTranslate> = {};
	public packages: string[] = [];

	readonly formatter: Formatter;
	readonly cached: Map<string, LexiconEntryResponse> = new Map();
	readonly config: Required<Lexicon.LanguageStoreConfig> = {
		prefix: "{{",
		suffix: "}}",
	};

	/**
	 * Default replacement for variables inside strings.
	 */
	defaultReplacement: any = {};

	/**
	 * Creates a new LanguageStore instance.
	 *
	 * @param {Lexicon.LanguageStoreOptions} options - The options for the language store.
	 */
	constructor(options: Lexicon.LanguageStoreOptions = {}) {
		const { language, lambda, packages, lexicon, options: opts, formatters, defaultReplacement } = options;

		if (language) {
			this.language = language;
		}
		if (lambda) {
			this.lambda = lambda;
		}
		if (lexicon) {
			Object.assign(this.lexicon, mergeData(lexicon));
		}
		if (packages != null) {
			for (const name in packages) {
				this.packages.push(name);
				Object.assign(this.lexicon, mergeData(packages[name], name));
			}
		}
		if (defaultReplacement != null) {
			Object.assign(this.defaultReplacement, defaultReplacement);
		}

		this.formatter = new Formatter(this.language, { ...opts });
		if (formatters != null) {
			for (const name in formatters) {
				this.formatter.add(name, formatters[name]);
			}
		}

		let { suffix, prefix } = options;
		if (suffix) {
			suffix = suffix.trim();
			if (suffix.length) {
				this.config.suffix = suffix;
			}
		}
		if (prefix) {
			prefix = prefix.trim();
			if (prefix.length) {
				this.config.prefix = prefix;
			}
		}
	}

	/**
	 * Translates a key.
	 *
	 * If the key is not translatable, it will return null.
	 * If the key represents a plural form, it will return an array of strings for different plural forms.
	 * Arrays are used for word declension based on number (plurals).
	 *
	 * @param {string} key - The key to translate.
	 * @returns {string | string[] | null} The translated key, array of plural forms, or null if not translatable.
	 */
	line(key: string): string | string[] | null {
		return this.lexicon.hasOwnProperty(key) ? this.lexicon[key] : null;
	}

	/**
	 * Checks if a key is translatable.
	 *
	 * @param {string} key - The key to check.
	 * @returns True if the key is translatable, false otherwise.
	 */
	translatable(key: string): boolean {
		return this.lexicon.hasOwnProperty(key) && this.lexicon[key] != null;
	}

	/**
	 * Translates a key with an alternative and a replacement.
	 *
	 * The alternative can be a string, null or a function that returns a string.
	 * The replacement object is used to replace values inside the string.
	 *
	 * @example
	 * ```ts
	 * const lexicon = new LanguageStore({
	 * 	lexicon: {
	 * 	  "hello": "Hello, {{ name }}!"
	 * 	}
	 * });
	 *
	 * lexicon.translate("hello", null, { name: "John" }) // "Hello, John!"
	 * lexicon.translate("goodbye", null, { name: "John" }) // "goodbye"
	 * lexicon.translate("goodbye", "Goodbye {{ name }}!", { name: "John" }) // "Goodbye John!"
	 * ```
	 *
	 * @param {string} key - The key to translate.
	 * @param {string | null | ((key: string) => string)} alternative - The alternative to use if the key is not translatable.
	 * @param {any} replacement - Object for replacing values inside the string.
	 * @returns {string} The translated key.
	 */
	translate(key: string, alternative?: string | null | ((key: string) => string), replacement?: any): string {
		return format(this, key, alternative, replacement);
	}

	/**
	 * Replaces variables inside a string.
	 *
	 * @param {string} text - The text to replace variables in.
	 * @param {any} replacement - Object for replacing values inside the string.
	 * @returns {string} The text with replaced variables.
	 */
	replace(text: string, replacement: any): string {
		return replace(this, text, replacement);
	}

	/**
	 * Pluralizes a value based on the number.
	 *
	 * @param {number} number - The number to pluralize.
	 * @param {string[]} variant - The variants to use.
	 * @returns {string} The pluralized value.
	 */
	plural(number: number, variant: string[]): string {
		return String(variant[(plurals[this.language] || plurals.en)(number)] || "").trim();
	}

	/**
	 * Sets raw language data directly, without any handlers or loaders.
	 * The data should be pre-formatted according to the expected structure.
	 *
	 * @param {Lexicon.Data} data - The formatted language data to set directly.
	 */
	setLanguageData(data: Lexicon.Data) {
		const { id, lexicon, lambda, packages } = data;
		this.formatter.setLanguage(id);
		this.language = id;
		this.lexicon = lexicon;
		this.lambda = lambda;
		this.packages = packages;
	}

	/**
	 * Reloads the language.
	 *
	 * @param {string} id - The id of the language to reload.
	 * @returns {Promise<void>} A promise that resolves when the language is reloaded.
	 */
	async reloadLanguage(id: string): Promise<void> {
		const data = await reload(id);
		this.setLanguageData(data);
		this.cached.clear();
	}

	/**
	 * Loads a language.
	 *
	 * @param {string} id - The id of the language to load.
	 * @param {string} packageName - The name of the package to load.
	 * @returns {Promise<void>} A promise that resolves when the language is loaded.
	 */
	async loadLanguage(id: string, packageName?: string): Promise<void> {
		const data = await load(id, packageName);
		this.setLanguageData(data);
		this.cached.clear();
	}

	/**
	 * Loads a language package.
	 *
	 * @param {string} packageName - The name of the package to load.
	 * @returns {Promise<void>} A promise that resolves when the language package is loaded.
	 */
	async loadLanguagePackage(packageName: string): Promise<void> {
		const data = await load(this.language, packageName);
		this.setLanguageData(data);
	}
}
