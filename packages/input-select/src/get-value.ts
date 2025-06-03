type Invalid = { valid: false };

type Valid<T> = { valid: true; value: T | T[] | null };

type GetValueOptions = {
	multiple: boolean;
	clearable: boolean;
	valueAsNumber: boolean;
};

const invalid = (): Invalid => ({ valid: false });

const valid = <T extends string | number>(value: T | T[] | null): Valid<T> => ({ valid: true, value });

export const getValue = <T extends string | number>(
	prevValue: T | T[] | null,
	nextValue: string | null,
	{ multiple, clearable, valueAsNumber }: GetValueOptions
): Invalid | Valid<T> => {
	if (nextValue == null) {
		if (!clearable) {
			return invalid();
		}
		if (multiple) {
			return valid([]);
		}
		return valid<T>(null);
	}

	const value = valueAsNumber ? parseInt(nextValue) : nextValue;
	if (typeof value === "number" && isNaN(value)) {
		return invalid();
	}

	if (multiple) {
		const arrayValue = Array.isArray(prevValue) ? prevValue.slice() : prevValue == null ? [] : [prevValue];

		const index = arrayValue.indexOf(value as T);
		if (index === -1) {
			arrayValue.push(value as T);
		} else if (arrayValue.length > 0 || clearable) {
			arrayValue.splice(index, 1);
		} else {
			return invalid();
		}

		return valid(arrayValue);
	}

	if (value !== prevValue) {
		return valid(value as T);
	}

	if (clearable && prevValue != null) {
		return valid<T>(null);
	}

	return invalid();
};
