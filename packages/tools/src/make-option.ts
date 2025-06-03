import type { InputSelectOption } from "./types";

/**
 * Creates an option for a select input.
 *
 * @param {InputSelectOption | string | number} item - The item to create an option for.
 * @param {Partial<Record<string | number, string>>} dump - Key-value object to prevent duplicates.
 * @returns {InputSelectOption | null} The created option or null if duplicate found.
 */
const makeOption = (
	item: InputSelectOption | string | number,
	dump: Partial<Record<string | number, string>>
): InputSelectOption | null => {
	if (typeof item === "string" || typeof item === "number") {
		if (dump.hasOwnProperty(item)) {
			return null;
		}
		const label = `${item}`;
		dump[item] = label;
		return {
			value: item,
			label: label,
		};
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
	dump[item.value] = item.label;
	return item;
};

export { makeOption };
