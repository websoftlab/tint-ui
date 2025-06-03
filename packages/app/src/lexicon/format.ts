import type { LanguageStore } from "./language-store";
import type { PEntryVar, PEntryLiteral } from "./parser";

import { parser } from "./parser";
import { plurals } from "./plurals";

const replaceText = (store: LanguageStore, entry: PEntryVar | PEntryLiteral, replacement: any, depth: number) => {
	let value = entry.type === "var" ? replacement[entry.name] : entry.value;
	if (value == null && entry.type === "var") {
		value = entry.defaultValue;
	}

	if (entry.lambda) {
		const cb = store.lambda[entry.lambda];
		if (typeof cb === "function") {
			value = cb(value, { name: entry.type === "var" ? entry.name : null, store, replacement });
		}
	}

	if (entry.plural) {
		let variant = Array.isArray(entry.plural) ? entry.plural : store.lexicon[entry.plural];
		if (typeof variant === "string") {
			variant = variant.split("||");
		}
		if (Array.isArray(variant)) {
			let number = value;
			if (typeof number !== "number") {
				number = parseInt(String(number));
			}
			if (isNaN(number) || !isFinite(number)) {
				number = 0;
			}
			const select = (plurals[store.language] || plurals.en)(number);
			value = String(variant[select] || "").trim();
			if (value.includes(store.config.prefix)) {
				value = recursive(store, value, null, { ...replacement, value: number }, true, depth + 1);
			}
		}
	}

	if (entry.formats.length) {
		value = store.formatter.format(value, entry.formats);
	}

	return value == null ? "" : String(value);
};

const recursive = (
	store: LanguageStore,
	key: string,
	alternative: string | null | undefined | ((key: string) => string),
	replacement: any,
	raw = false,
	depth = 0
) => {
	if (depth > 1) {
		return "";
	}

	let cacheKey: string | null = null;
	let text: string | string[] | undefined;

	if (raw) {
		text = key;
		cacheKey = key;
	} else {
		text = store.lexicon[key];
		if (text == null) {
			if (alternative == null) {
				return key;
			}
			if (typeof alternative === "function") {
				text = alternative(key);
			} else {
				text = alternative;
			}
		} else {
			cacheKey = key;
		}
		if (Array.isArray(text)) {
			text = text[0];
		}
		text = String(text);
		if (cacheKey == null) {
			cacheKey = text;
		}
	}

	if (!text.length) {
		return text;
	}

	let cache = store.cached.get(cacheKey);
	if (!cache || cache.original !== text) {
		cache = parser(text, store.config.prefix, store.config.suffix);
		store.cached.set(cacheKey, cache);
		if (cacheKey !== text) {
			store.cached.set(text, cache);
		}
	}

	if (!cache.vars) {
		return cache.original;
	}

	let result = "";
	replacement = {
		locale: store.language,
		...store.defaultReplacement,
		...replacement,
	};

	for (const entry of cache.entries) {
		if (entry.type === "text") {
			result += entry.value;
		} else {
			result += replaceText(store, entry, replacement, depth);
		}
	}

	return result;
};

export const replace = (store: LanguageStore, text: string, replacement: any) => {
	return recursive(store, text, null, replacement, true);
};

export const format = (
	store: LanguageStore,
	key: string,
	alternative?: string | null | undefined | ((key: string) => string),
	replacement?: any
) => {
	return recursive(store, key, alternative, replacement);
};
