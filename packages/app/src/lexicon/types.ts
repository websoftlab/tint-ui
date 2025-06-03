import type { LanguageStore } from "./language-store";

/**
 * Types for the lexicon.
 */
export namespace Lexicon {
	/**
	 * Input dictionary type.
	 */
	export type InputDict = { [key: string]: string | string[] | InputDict };

	/**
	 * Dictionary type.
	 */
	export type Dict = Record<string, string | string[]>;

	/**
	 * Formatter type.
	 */
	export type Formatter<T = any, P = any> = (value: T, language: string, options: P) => string | number;

	/**
	 * Formatter cache type.
	 */
	export type FormatterCache<T = any> = (value: T) => string | number;

	/**
	 * Formatter cache builder type.
	 */
	export type FormatterCacheBuilder<T = any, P = any> = (language: string, options: P) => FormatterCache<T>;

	/**
	 * Language store interface.
	 */
	export interface LanguageStoreInterface {
		/**
		 * The current language.
		 */
		readonly language: string;

		/**
		 * The lexicon.
		 */
		readonly lexicon: Dict;

		/**
		 * The lambda translation functions.
		 */
		readonly lambda: Record<string, LambdaTranslate>;

		/**
		 * The packages.
		 */
		readonly packages: string[];

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
		line(key: string): string | string[] | null;

		/**
		 * Checks if a key is translatable.
		 *
		 * @param {string} key - The key to check.
		 * @returns True if the key is translatable, false otherwise.
		 */
		translatable(key: string): boolean;

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
		translate(key: string, alternative?: string | null | ((key: string) => string), replacement?: any): string;

		/**
		 * Replaces variables inside a string.
		 *
		 * @param {string} text - The text to replace variables in.
		 * @param {any} replacement - Object for replacing values inside the string.
		 * @returns {string} The text with replaced variables.
		 */
		replace(text: string, replacement: any): string;

		/**
		 * Pluralizes a value based on the number.
		 *
		 * @param {number} number - The number to pluralize.
		 * @param {string[]} variant - The variants to use.
		 * @returns {string} The pluralized value.
		 */
		plural(number: number, variant: string[]): string;

		/**
		 * Reloads the language.
		 *
		 * @param {string} id - The id of the language to reload.
		 * @returns {Promise<void>} A promise that resolves when the language is reloaded.
		 */
		reloadLanguage(id: string): Promise<void>;

		/**
		 * Loads a language.
		 *
		 * @param {string} id - The id of the language to load.
		 * @param {string} packageName - The name of the package to load.
		 * @returns {Promise<void>} A promise that resolves when the language is loaded.
		 */
		loadLanguage(id: string, packageName?: string): Promise<void>;

		/**
		 * Loads a language package.
		 *
		 * @param {string} packageName - The name of the package to load.
		 * @returns {Promise<void>} A promise that resolves when the language package is loaded.
		 */
		loadLanguagePackage(packageName: string): Promise<void>;
	}

	/**
	 * Lambda translation function.
	 */
	export type LambdaTranslate<Val = string> = (
		value: any,
		options: { name: string | null; store: LanguageStore; replacement: any }
	) => Val;

	/**
	 * Input data for the language store.
	 */
	export interface InputData {
		id: string;
		lexicon: InputDict;
		lambda: Record<string, LambdaTranslate>;
	}

	/**
	 * Compiled data for the language store.
	 */
	export interface Data {
		id: string;
		lexicon: Dict;
		lambda: Record<string, LambdaTranslate>;
		packages: string[];
	}

	/**
	 * Function for handling events that load translation data from external sources.
	 * Allows correcting and supplementing translations when needed.
	 */
	export type Listener = (data: Data & { packageName: string | null }) => Promise<void> | void;

	/**
	 * Language store configuration.
	 */
	export interface LanguageStoreConfig {
		/**
		 * The prefix for variables inside strings.
		 */
		prefix?: string;

		/**
		 * The suffix for variables inside strings.
		 */
		suffix?: string;
	}

	/**
	 * Language store options.
	 */
	export interface LanguageStoreOptions extends LanguageStoreConfig {
		/**
		 * The formatters for formatting variables according to modifiers.
		 */
		formatters?: { [key: string]: Formatter };

		/**
		 * The options for the Formatter instance.
		 */
		options?: { [key: string]: any };

		/**
		 * Initial lexicon packages for the language store.
		 *
		 * @example
		 * ```ts
		 * const lexicon = new LanguageStore({
		 * 	packages: {
		 * 	  "user": {
		 * 	    "welcome": "Welcome, {{ name }}!"
		 * 	   }
		 *   }
		 * });
		 *
		 * lexicon.translate("user::welcome", null, { name: "John" }); // "Welcome, John!"
		 * ```
		 */
		packages?: Record<string, InputDict>;

		/**
		 * Initial language for the language store.
		 */
		language?: string;

		/**
		 * Initial main lexicon for the language store.
		 */
		lexicon?: InputDict;

		/**
		 * The lambda functions for string replacement without templates.
		 */
		lambda?: Record<string, Lexicon.LambdaTranslate>;

		/**
		 * Default object for replacing variables inside strings.
		 */
		defaultReplacement?: any;
	}
}
