"use client";

import * as React from "react";
import { isLocalStorage } from "./browser-support";
import { logger } from "./logger";

type StateValue<T> = T | (() => T);

/**
 * Safely sets a value in localStorage.
 */
const setStorageValue = (name: string, value: unknown): void => {
	if (!isLocalStorage()) return;
	try {
		localStorage.setItem(name, JSON.stringify(value));
	} catch (err) {
		logger.warn("Local storage write failure", err);
	}
};

const getDefaultValue = <T extends string | number | boolean | object>(value: StateValue<T>): T =>
	typeof value === "function" ? value() : value;

/**
 * Safely retrieves a value from localStorage.
 */
const getStorageValue = <T>(name: string): T | null => {
	if (!isLocalStorage()) return null;
	try {
		const value = localStorage.getItem(name);
		return value ? (JSON.parse(value) as T) : null;
	} catch (err) {
		logger.warn("Local storage read failure", err);
		return null;
	}
};

/**
 * Initializes the React state with a value from localStorage or default.
 */
const getReactState = <T extends string | number | boolean | object>(
	name: string,
	defaultState: StateValue<T>
): { name: string; value: T } => {
	return {
		name,
		value: (getStorageValue<T>(name) ?? getDefaultValue(defaultState)) as T,
	};
};

/**
 * Custom React hook for synchronizing state with localStorage.
 *
 * @example
 * ```tsx
 * const [value, setValue] = useLocalStorageState("my-key", "default-value");
 * ```
 * @returns {[T, (value: T | ((prev: T) => T)) => void]} The state and the setter function.
 */
const useLocalStorageState = <T extends string | number | boolean | object>(
	name: string,
	defaultState: StateValue<T>
): [T, (value: T | ((prev: T) => T)) => void] => {
	const [reactState, setReactState] = React.useState(() => getReactState(name, defaultState));
	const { onMount, setState } = React.useMemo(() => {
		let localState = reactState.value;
		let mount = false;
		let invokePrevent = false;
		return {
			setState(value: T | ((prev: T) => T)) {
				if (!mount) {
					return;
				}
				if (typeof value === "function") {
					value = value(localState);
				}
				if (value === localState) {
					return;
				}
				localState = value as T;
				invokePrevent = true;
				setStorageValue(name, localState);
				invokePrevent = false;
				setReactState({ name, value: localState });
			},
			onMount() {
				if (reactState.name !== name) {
					const state = getReactState(name, defaultState);
					localState = state.value;
					setReactState(state);
				}

				mount = true;
				const handleStorageChange = (event: StorageEvent) => {
					if (invokePrevent || event.storageArea !== localStorage || event.key !== name) return;

					let value: T | null = null;
					if (event.newValue) {
						try {
							value = JSON.parse(event.newValue) as T;
						} catch (err) {
							logger.warn(`Failed to parse localStorage value for key "${name}"`, err);
						}
					}

					localState = value ?? getDefaultValue(defaultState);
					setReactState({ name, value: localState });
				};

				window.addEventListener("storage", handleStorageChange);
				return () => {
					mount = false;
					window.removeEventListener("storage", handleStorageChange);
				};
			},
		};
	}, [name]);
	React.useEffect(onMount, [onMount]);
	return [reactState.value, setState];
};

export { useLocalStorageState };
