import type { FilterFn } from "@tanstack/react-table";

const isEmpty = (value: unknown, filterValue: unknown) =>
	value == null || (Array.isArray(filterValue) && filterValue.length === 0);

const filterBoolean: FilterFn<any> = (row, columnId, filterValue) => {
	const value = row.getValue(columnId);
	if (Array.isArray(filterValue)) {
		filterValue = filterValue[0];
	}
	if (value == null) {
		return filterValue === "";
	}
	if (typeof filterValue === "boolean") {
		return value === filterValue;
	}
	if (filterValue === "1") {
		return value === true;
	}
	if (filterValue === "0") {
		return value === false;
	}
	return false;
};

const isNumberValue = (value: number, filterValue: unknown) => {
	return value === (typeof filterValue === "number" ? filterValue : parseInt(String(filterValue)));
};

const filterNumber: FilterFn<any> = (row, columnId, filterValue) => {
	const value = row.getValue(columnId);
	if (isEmpty(value, filterValue)) {
		return true;
	}
	if (typeof value !== "number") {
		return false;
	}
	return isNumberValue(value, Array.isArray(filterValue) ? filterValue[0] : filterValue);
};

const filterNumberMultiple: FilterFn<any> = (row, columnId, filterValue) => {
	const value = row.getValue(columnId);
	if (isEmpty(value, filterValue)) {
		return true;
	}
	if (typeof value !== "number") {
		return false;
	}
	if (Array.isArray(filterValue)) {
		for (const val of filterValue) {
			if (isNumberValue(value, val)) {
				return true;
			}
		}
	} else if (isNumberValue(value, filterValue)) {
		return true;
	}
	return false;
};

const filterString: FilterFn<any> = (row, columnId, filterValue) => {
	const value = row.getValue(columnId);
	if (isEmpty(value, filterValue)) {
		return true;
	}
	return value === String(Array.isArray(filterValue) ? filterValue[0] : filterValue);
};

const filterStringMultiple: FilterFn<any> = (row, columnId, filterValue) => {
	const value = row.getValue(columnId);
	if (isEmpty(value, filterValue)) {
		return true;
	}
	if (Array.isArray(filterValue)) {
		for (const val of filterValue) {
			if (value === String(val)) {
				return true;
			}
		}
	} else if (value === String(filterValue)) {
		return true;
	}
	return false;
};

export { filterBoolean, filterNumber, filterNumberMultiple, filterString, filterStringMultiple };
