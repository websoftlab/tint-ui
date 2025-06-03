import type { InputSelectLexicon } from "./types";

export const defaultLexicon: InputSelectLexicon = {
	placeholder: "",
	loading: "Hang on…",
	search: "Search",
	notFound: "No results found",
	empty: "The list is empty",
	selected: "{{ count }} selected",
};

const regVar = /\{\{(.+?)}}/g;

export const getText = function (
	lexicon: Partial<InputSelectLexicon>,
	key: keyof typeof defaultLexicon,
	data?: { count: number }
) {
	let text = lexicon[key];
	if (text == null) {
		text = defaultLexicon[key];
	}
	if (typeof text === "function") {
		return text(data!);
	}
	if (data == null) {
		return text;
	}
	return text.replace(regVar, (name, id) => {
		id = id.trim();
		if (data.hasOwnProperty(id)) {
			return String((data as any)[id]);
		}
		return name;
	});
};
