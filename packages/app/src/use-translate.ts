import type { Lexicon } from "./lexicon";

import * as React from "react";
import { useApp } from "./use-app";
import { reaction } from "mobx";

type Translator = Lexicon.LanguageStoreInterface["translate"];

/**
 * React hook for translating text.
 *
 * The hook keeps track of which translation strings are being used in the component,
 * maintains a cache of these translations, and reactively updates when the translations change.
 *
 * @param names - The names of the translations to use.
 * @returns {Translator & { [key in K]: Translator }} The translator and the translations.
 */
const useTranslate = function <K extends string>(names: K[] = []): Translator & { [key in K]: Translator } {
	const app = useApp();
	const [, setState] = React.useState({ language: app.language, count: 0 });

	// reset current
	const ref = React.useRef<string[]>([]);
	ref.current = [];

	const { forceMount, onMount } = React.useMemo(() => {
		let last: string[] = [];
		let undoLast: null | (() => void) = null;

		return {
			forceMount() {
				let force = undoLast == null || last.length !== ref.current.length;
				if (!force) {
					for (let i = 0; i < ref.current.length; i++) {
						if (last[i] !== ref.current[i]) {
							force = true;
							break;
						}
					}
				}

				if (!force) {
					return;
				}

				last = ref.current;
				if (undoLast != null) {
					undoLast();
				}

				undoLast = reaction(
					() => {
						let val = "";
						for (const key of last) {
							const line = app.lexicon[key];
							if (Array.isArray(line)) {
								val += line.join("|");
							} else if (line != null) {
								val += "|" + line;
							}
						}
						return val;
					},
					() => {
						setState((prev) => ({
							language: prev.language,
							count: prev.count < Number.MAX_SAFE_INTEGER ? prev.count + 1 : 0,
						}));
					}
				);
			},
			onMount() {
				const undo = reaction(
					() => app.language,
					(language) => {
						setState({ language, count: 0 });
					}
				);
				return () => {
					undo();
					if (undoLast != null) {
						undoLast();
					}
				};
			},
		};
	}, []);

	React.useEffect(onMount, [onMount]);
	React.useEffect(forceMount);

	return React.useMemo(() => {
		const translate = ((...args) => {
			return app.translate(...args);
		}) as Translator & { [key in K]: Translator };
		for (const name of names) {
			const prefix = `${name}:`;
			Object.defineProperty(translate, name, {
				value: ((name, alternative, replacement) => {
					const key = prefix + name;
					if (!ref.current.includes(key)) {
						ref.current.push(key);
					}
					return app.translate(key, alternative == null ? name : alternative, replacement);
				}) as Translator,
			});
		}
		return translate;
	}, [app, names.join("|")]);
};

export { useTranslate };
