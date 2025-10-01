import type { InputSelectOption } from "./types";

/**
 * Creates an option for a select input.
 *
 * @param {InputSelectOption | string | number} item - The item to create an option for.
 * @param {Partial<Record<string | number, InputSelectOption>>} dump - Key-value object to prevent duplicates.
 * @returns {InputSelectOption | null} The created option or null if duplicate found.
 */
const makeOption = (
	item: InputSelectOption | string | number,
	dump: Partial<Record<string | number, InputSelectOption>>
): InputSelectOption | null => {
	if (typeof item === "string" || typeof item === "number") {
		if (dump.hasOwnProperty(item)) {
			return null;
		}
		const label = `${item}`;
		const option: InputSelectOption = {
			value: item,
			label: label,
		};
		dump[item] = option;
		return option;
	}
	if (item == null || !item.label) {
		return null;
	}
	if (item.value == null) {
		item.value = item.label;
	}
	if (dump.hasOwnProperty(item.value)) {
		return null;
	}
	dump[item.value] = item;
	return item;
};

export { makeOption };
