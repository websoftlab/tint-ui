type PToken = { type: "text" | "string"; value: string };

type PLiteral = { f: string; v: string; l: number };

type PEntryVar = {
	type: "var";
	name: string;
	formats: string[];
	lambda: string | null;
	plural: string[] | string | null;
	defaultValue: string | boolean | number | null;
};

type PEntryText = { type: "text"; value: string };

type PEntryLiteral = {
	type: "literal";
	value: string;
	formats: string[];
	lambda: string | null;
	plural: string[] | string | null;
};

type PEntry = PEntryText | PEntryVar | PEntryLiteral;

interface LexiconEntryResponse {
	original: string;
	vars: boolean;
	entries: PEntry[];
}

const getString = (text: string, index: number, quot: string) => {
	const start = ++index;
	while (true) {
		const next = text.indexOf(quot, index);
		if (next === -1) {
			return null;
		}
		let slashes = 0;
		for (let find = next - 1; find > next; find--) {
			if (text.charAt(find) !== "\\") {
				break;
			}
			slashes++;
		}
		if (slashes % 2 === 1) {
			index = next + 1;
		} else if (start === next) {
			return null;
		} else {
			return { index: next, value: text.substring(start, next).replace(/\\(.)/g, "$1") };
		}
	}
};

const singleLiterals = ["[", "]", ","];
const literals: PLiteral[] = [
	{ f: "-", v: "--", l: 2 },
	{ f: "-", v: "->", l: 2 },
	{ f: "=", v: "=>", l: 2 },
];

const getTokens = (text: string, index: number, right: string) => {
	let prev = "";
	let char = "";

	const end: PLiteral = { f: right.charAt(0), v: right, l: right.length };
	const tokens: PToken[] = [];
	const addToken = (char?: string) => {
		if (prev.length) {
			tokens.push({ type: "text", value: prev });
			prev = "";
		}
		if (char != null) {
			tokens.push({ type: "text", value: char });
		}
	};
	const isLiteral = (literal: PLiteral) => {
		return literal.f === char && text.substring(index, index + literal.l) === literal.v;
	};

	top: for (; index < text.length; index++) {
		char = text.charAt(index);

		// end entry
		if (isLiteral(end)) {
			addToken();
			return { tokens, index: index + end.l };
		}

		if (char === "'" || char === '"' || char === "`") {
			addToken();
			const find = getString(text, index, char);
			if (!find) {
				return null;
			}
			tokens.push({ type: "string", value: find.value });
			index = find.index;
			continue;
		}

		if (char.charCodeAt(0) < 33) {
			addToken();
		} else if (singleLiterals.includes(char)) {
			addToken(char);
		} else {
			for (const literal of literals) {
				if (isLiteral(literal)) {
					addToken(literal.v);
					index = index + literal.l - 1;
					continue top;
				}
			}
			prev += char;
		}
	}

	return null;
};

const addFormatter = (entry: PEntryVar, token: PToken) => {
	if (token.type === "string" || !/^[a-z\d_\-]+$/i.test(token.value)) {
		return null;
	}
	const value = token.value.toLowerCase();
	if (value === "default") {
		return value;
	}
	entry.formats.push(value);
	return value;
};

const addDefaultValue = (entry: PEntryVar, token: PToken) => {
	const { value } = token;
	if (token.type === "string") {
		entry.defaultValue = value;
		return true;
	}

	const isTrue = value === "true";
	if (isTrue || value === "false") {
		entry.defaultValue = isTrue;
		return true;
	}
	if (value === "null") {
		return true;
	}

	const number = value.includes(".") ? parseFloat(value) : parseInt(value);
	if (isNaN(number)) {
		return false;
	}

	entry.defaultValue = number;
	return true;
};

const addLambda = (entry: PEntryVar, token: PToken) => {
	if (token.type === "string" || !/^[a-z][a-z\d_]*$/i.test(token.value)) {
		return false;
	}
	entry.lambda = token.value;
	return true;
};

/**
 * Parses a text into lexical tokens and caches them for future processing.
 * The tokens are then processed according to rules to avoid re-parsing each time.
 *
 * @param {string} text - The text to parse into tokens.
 * @param {string} left - The left delimiter for variables.
 * @param {string} right - The right delimiter for variables.
 * @returns {LexiconEntryResponse} The parsed and cached lexicon entry response.
 */
const parser = (text: string, left: string, right: string): LexiconEntryResponse => {
	if (!text.includes(left)) {
		return {
			original: text,
			vars: false,
			entries: [],
		};
	}

	const entries: PEntry[] = [];

	let start = 0;
	while (true) {
		const index = text.indexOf(left, start);
		if (index === -1) {
			break;
		}

		const find = getTokens(text, index + left.length, right);
		if (!find) {
			break;
		}

		// add empty text
		if (start < index) {
			entries.push({ type: "text", value: text.substring(start, index) });
		}

		const plural: string[] = [];
		const entry: PEntryVar = {
			type: "var",
			name: "",
			formats: [],
			lambda: null,
			plural: null,
			defaultValue: null,
		};

		start = find.index;

		let step = 0;
		let literal = false;
		let nameIsString = false;

		for (const token of find.tokens) {
			const { value } = token;
			if (token.type === "text" && (value === "->" || value === "=>" || value === "--")) {
				if (step !== 1) {
					break;
				} else if (value === "->") {
					step = 10;
				} else if (value === "=>") {
					step = 11;
				} else {
					literal = nameIsString;
				}
			} else if (step === 0) {
				nameIsString = token.type === "string";
				entry.name = value;
				step = 1;
			} else if (step === 1) {
				const formatter = addFormatter(entry, token);
				if (formatter == null) {
					break;
				}
				step = formatter === "default" ? 31 : 30;
			} else if (step === 10) {
				if (token.type === "text" && value === "[") {
					step = 20;
				} else {
					entry.plural = value;
					step = 30;
				}
			} else if (step === 11) {
				if (!addLambda(entry, token)) {
					break;
				}
				step = 30;
			} else if (step === 20) {
				if (token.type !== "string") {
					break;
				}
				plural.push(value);
				step = 21;
			} else if (step === 21) {
				if (token.type !== "text") {
					break;
				}
				if (value === ",") {
					step = 20;
				} else if (value === "]") {
					step = 30;
				} else {
					break;
				}
			} else if (step === 30) {
				const formatter = addFormatter(entry, token);
				if (formatter == null) {
					break;
				}
				if (formatter === "default") {
					step = 31;
				}
			} else if (step === 31) {
				if (!addDefaultValue(entry, token)) {
					break;
				}
				step = 30;
			} else {
				break;
			}
		}

		if (plural.length) {
			entry.plural = plural;
		}

		if (literal) {
			entries.push({
				type: "literal",
				value: entry.name,
				formats: entry.formats,
				plural: entry.plural,
				lambda: entry.lambda,
			});
		} else {
			entries.push(entry);
		}
	}

	if (start < text.length) {
		entries.push({ type: "text", value: text.substring(start) });
	}

	return {
		original: text,
		vars: true,
		entries,
	};
};

export { parser };
export type { LexiconEntryResponse, PEntryVar, PEntryText, PEntryLiteral, PEntry };
