import type { ElementType } from "react";
import type { Classes, ClassMergeMode, ThemeMode, ThemePropsType } from "./types";

import { makeObservable, observable, action } from "mobx";

interface ThemeModeController {
	get(): ThemeMode | null;
	set(value: ThemeMode): void;
}

interface ThemeConfig {
	root: ThemeStore | null;
	theme: ThemeMode;
	classesMode: ClassMergeMode;
	classes: Record<string, Record<string, string>>;
	icons: Record<string, ElementType>;
	mixin: Record<string, Readonly<Omit<ThemeConfig, "mixin" | "controller">>>;
	props: Record<string, ThemePropsType>;
	controller?: ThemeModeController;
}

const control = Symbol();

const controlTest = function <T>(store: ThemeStore, fn: (t: ThemeStore) => T | null | undefined, defaultValue: T) {
	let value = fn(store);
	if (value != null) {
		return value;
	}
	if (store.root == null || store[control]) {
		return defaultValue;
	}
	store[control] = true;
	value = fn(store.root);
	store[control] = false;
	return value == null ? defaultValue : value;
};

class ThemeStore implements ThemeConfig {
	[control]: boolean = false;
	theme: ThemeMode = "system";

	readonly classesMode: ClassMergeMode = "merge";
	readonly root: ThemeStore | null = null;
	readonly classes: Record<string, Record<string, string>> = {};
	readonly icons: Record<string, ElementType> = {};
	readonly mixin: Record<string, Readonly<Omit<ThemeConfig, "mixin" | "controller">>> = {};
	readonly props: Record<string, ThemePropsType> = {};
	readonly controller: ThemeModeController | undefined = undefined;

	constructor(config: Partial<ThemeConfig> = {}) {
		const { icons, mixin, classes, props, classesMode, controller } = config;
		let { theme } = config;

		if (controller) {
			this.controller = controller;
			const mode = controller.get();
			if (mode != null) {
				theme = mode;
			}
		}
		if (theme) {
			this.setMode(theme);
		}
		if (classesMode && ["merge", "combine", "name-combine"].includes(classesMode)) {
			this.classesMode = classesMode;
		}
		if (classes) {
			this.classes = classes;
		}
		if (props) {
			this.props = props;
		}
		if (icons) {
			this.icons = icons;
		}
		if (mixin) {
			this.mixin = mixin;
		}

		makeObservable(this, {
			theme: observable,
			classes: observable,
			icons: observable,
			mixin: observable,
			controller: observable,
			setMode: action,
		});
	}

	setMode(value: ThemeMode) {
		if (this.theme !== value && ["light", "dark", "system"].includes(value)) {
			this.theme = value;
			if (this.controller) {
				this.controller.set(value);
			}
		}
	}

	hasClasses(name: string): boolean {
		return controlTest(this, (t) => (t.classes.hasOwnProperty(name) ? true : null), false);
	}

	getClasses<T extends string = string>(name: string): Classes<T> | null {
		return controlTest(this, (t) => t.classes[name] as Classes<T> | undefined, null);
	}

	hasIcon(name: string): boolean {
		return controlTest(this, (t) => (t.icons.hasOwnProperty(name) ? true : null), false);
	}

	getIcon(name: string): ElementType | null {
		return controlTest(this, (t) => t.icons[name], null);
	}

	hasProps(name: string): boolean {
		return controlTest(this, (t) => (t.props.hasOwnProperty(name) ? true : null), false);
	}

	getProps<T extends object = object>(name: string): ThemePropsType<T> | null {
		return controlTest(this, (t) => t.props[name] as ThemePropsType<T>, null);
	}
}

export { ThemeStore };
export type { ThemeModeController, ThemeConfig };
