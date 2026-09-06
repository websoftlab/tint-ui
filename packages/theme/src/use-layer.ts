import * as React from "react";
import { FormPrefixContext, LayerContext, ThemeContext } from "./context";

interface UseLayerReturn {
	readonly name: string | null;
	readonly separator: string;
	dataId(value: string, ...suffix: (string | number | null | undefined)[]): string | undefined;
}

const useLayer = (): UseLayerReturn => {
	const {
		dataId: { enabled, name: defaultName, separator },
	} = React.useContext(ThemeContext);
	const name = React.useContext(LayerContext) || defaultName;
	return {
		name,
		separator,
		dataId: React.useCallback(
			(value: string, ...suffix: string[]) => {
				if (!enabled) {
					return undefined;
				}
				let id = value;
				for (const sid of suffix) {
					if (sid != null && sid !== "") {
						id += separator + String(sid);
					}
				}
				if (name) {
					return name + separator + id;
				}
				return id;
			},
			[name, separator]
		),
	};
};

const useLayerForm = (): UseLayerReturn => {
	const {
		dataId: { enabled, name: defaultName, separator },
	} = React.useContext(ThemeContext);
	const { joinName, depth } = React.useContext(FormPrefixContext);
	const name = React.useContext(LayerContext) || defaultName;
	return {
		name,
		separator,
		dataId: React.useCallback(
			(value: string, ...suffix: string[]) => {
				if (!enabled) {
					return undefined;
				}
				let id = value;
				if (depth > 0) {
					id = joinName(id, "-");
				}
				for (const sid of suffix) {
					if (sid != null && sid !== "") {
						id += separator + String(sid);
					}
				}
				if (name) {
					return name + separator + id;
				}
				return id;
			},
			[name, separator, depth, joinName]
		),
	};
};

interface ApplyDataIdOptions<T extends object> {
	prefix?: string;
	property?: keyof T;
	suffix?: (string | number | null | undefined)[];
}

const attributeDataId = "data-id";
const applyDataId = <T extends object>(layer: UseLayerReturn, props: T, opts: ApplyDataIdOptions<T> = {}): T => {
	if (attributeDataId in props) {
		return props;
	}
	const { property = "id" as keyof T } = opts;
	const value = props[property];
	if (typeof value !== "string" || value === "") {
		return props;
	}
	const { prefix, suffix = [] } = opts;
	return {
		[attributeDataId]: layer.dataId(prefix ? `${prefix}${value}` : value, ...suffix),
		...props,
	} as T;
};

export { attributeDataId, useLayer, useLayerForm, applyDataId };
export type { UseLayerReturn, ApplyDataIdOptions };
