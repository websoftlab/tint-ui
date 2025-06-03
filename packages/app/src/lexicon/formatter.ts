import { logger } from "@tint-ui/tools/logger";

import type { Lexicon } from "./types";

const getCleanedCode = (code: string) => code.replace("_", "-");

const clearCache = (formatter: Formatter, key: string, options?: any) => {
	const { cache } = formatter;
	for (const lng in cache) {
		cache[lng].delete(key);
	}
	if (options != null) {
		formatter.options[key] = {
			...formatter.options[key],
			...options,
		};
	}
};

const createCachedFormatter = (formatter: Formatter, key: string, fn: Lexicon.FormatterCacheBuilder) => {
	const { cache } = formatter;
	clearCache(formatter, key);
	return (val: any, lng: string, options: any) => {
		if (!cache[lng]) {
			cache[lng] = new Map();
		}
		let cb = cache[lng].get(key);
		if (!cb) {
			cb = fn(lng, options);
			cache[lng].set(key, cb);
		}
		return cb(val);
	};
};

class Formatter {
	language: string;
	formats: Record<string, Lexicon.Formatter | undefined> = {};
	options: any = {};
	cache: Record<string, Map<string, Lexicon.FormatterCache>> = {};

	constructor(language: string, options: any = {}) {
		this.language = getCleanedCode(language);
		this.options = options;
		this.formats = {
			number: createCachedFormatter(this, "number", (lng, opt) => {
				const formatter = new Intl.NumberFormat(lng, { ...opt });
				return (val) => formatter.format(val);
			}),
			currency: createCachedFormatter(this, "currency", (lng, opt) => {
				const formatter = new Intl.NumberFormat(lng, { ...opt, style: "currency" });
				return (val) => formatter.format(val);
			}),
			datetime: createCachedFormatter(this, "datetime", (lng, opt) => {
				const formatter = new Intl.DateTimeFormat(lng, { ...opt });
				return (val) => formatter.format(val);
			}),
			relativetime: createCachedFormatter(this, "relativetime", (lng, opt) => {
				const formatter = new Intl.RelativeTimeFormat(lng, { ...opt });
				return (val) => formatter.format(val, opt.range || "day");
			}),
			list: createCachedFormatter(this, "list", (lng, opt) => {
				const formatter = new (Intl as any).ListFormat(lng, { ...opt });
				return (val) => formatter.format(val);
			}),
			trim: (value) => {
				return value == null ? "" : String(value).trim();
			},
			upper: (value, lng) => {
				return value == null ? "" : String(value).toLocaleUpperCase(lng);
			},
			lower: (value, lng) => {
				return value == null ? "" : String(value).toLocaleLowerCase(lng);
			},
		};
	}

	setLanguage(language: string) {
		language = getCleanedCode(language);
		if (this.language !== language) {
			this.language = language;
			for (const key in this.cache) {
				this.cache[key].clear();
			}
		}
	}

	add(name: string, fc: Lexicon.Formatter, options?: any) {
		this.formats[name.toLowerCase().trim()] = fc;
		clearCache(this, name, options);
	}

	addCached(name: string, fc: Lexicon.FormatterCacheBuilder, options?: any) {
		this.formats[name.toLowerCase().trim()] = createCachedFormatter(this, name, fc);
		clearCache(this, name, options);
	}

	format(value: unknown, formats: string[]) {
		const result = formats.reduce((mem, f) => {
			const cb = this.formats[f];
			if (cb) {
				let formatted = mem;
				try {
					formatted = cb(mem, this.language, {
						...this.options[f],
					});
				} catch (error) {
					logger.warn(error);
				}
				return formatted;
			} else {
				logger.warn(`there was no format function for ${f}`);
			}
			return mem;
		}, value);

		if (result == null) {
			return "";
		}

		if (typeof result === "number") {
			return isNaN(result) ? 0 : result;
		}

		return String(result);
	}
}

export { Formatter };
