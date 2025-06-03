import { logger } from "@tint-ui/tools/logger";

import type { Lexicon } from "./types";

const prop = (prefix: string, key: string, depth: number) =>
	prefix.length ? `${prefix}${depth === 0 ? ":" : "."}${key}` : key;

const add = (result: Lexicon.Dict, key: string, value: string) => {
	if (result.hasOwnProperty(key)) {
		logger.error("Duplicate lexicon key, override:", key, result[key], value);
	}
	result[key] = value;
};

const addArray = (result: Lexicon.Dict, key: string, value: string[]) => {
	if (result.hasOwnProperty(key)) {
		logger.error("Duplicate lexicon key, override:", key, result[key], value);
	}
	result[key] = value.map((item) => String(item));
};

const append = (result: Lexicon.Dict, data: Lexicon.InputDict, prefix: string, depth = 0) => {
	if (depth > 0 && result.hasOwnProperty(prefix)) {
		logger.error("Duplicate lexicon key, ignore:", prefix);
	} else if (depth > 5) {
		logger.error(`Depth limit: ${depth}, ignore`);
	} else {
		for (const key in data) {
			const value = data[key];
			if (typeof value === "string") {
				add(result, prop(prefix, key, depth), value);
			} else if (Array.isArray(value)) {
				addArray(result, prop(prefix, key, depth), value);
			} else if (value != null && typeof value === "object") {
				append(result, value as Lexicon.InputDict, prop(prefix, key, depth), depth + 1);
			}
		}
	}
};

/**
 * Merges input data into a dictionary.
 *
 * Converted { "user": { "name": "John" } } into { "user.name": "John" }.
 *
 * @param {Lexicon.InputDict} data - The input data to merge.
 * @param {string} prefix - The prefix to add to the keys.
 * @returns {Lexicon.Dict} The merged dictionary.
 */
const mergeData = (data: Lexicon.InputDict, prefix: string = ""): Lexicon.Dict => {
	const result: Lexicon.Dict = {};
	append(result, data, prefix);
	return result;
};

export { mergeData };
