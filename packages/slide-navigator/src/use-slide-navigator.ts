"use client";

import type { SlideNavigatorApi, SlideNavigatorOptions } from "./types";

import * as React from "react";
import { createResizeHandler } from "./create-resize-handler";

type UseSlideNavigatorOptions = SlideNavigatorOptions & {
	children?: React.ReactNode;
	apiRef?: React.Ref<SlideNavigatorApi>;
};

const getChildrenHash = (children: React.ReactNode, depth: number = 1): string => {
	if (children == null) {
		return "null";
	}
	if (Array.isArray(children)) {
		return depth > 2
			? `array:[${children.length}]`
			: `children:[${(children as unknown[])
					.map((item) => getChildrenHash(item as React.ReactNode, depth + 1))
					.join(",")}]`;
	}
	if (React.isValidElement(children)) {
		if (children.type === React.Fragment) {
			return getChildrenHash(children.props.children);
		}
		const type = children.type;
		if (typeof type === "function") {
			return `name:[${(type as { displayName?: string }).displayName || type.name || "unknown"}]`;
		}
		return `element:[${type}]`;
	}
	return `type:[${typeof children}]`;
};

const useSlideNavigator = (
	options: UseSlideNavigatorOptions = {}
): [React.MutableRefObject<HTMLElement | null>, SlideNavigatorApi | null] => {
	const { apiRef, children } = options;

	const ref = React.useRef<HTMLElement | null>(null);
	const [api, setApi] = React.useState<SlideNavigatorApi | null>(null);
	const [, force] = React.useState(false);

	React.useEffect(() => {
		if (!ref.current) {
			return;
		}
		const { api, destroy } = createResizeHandler(
			ref.current,
			() => {
				force((prev) => !prev);
			},
			options
		);
		setApi(api);
		return destroy;
	}, []);

	React.useEffect(() => {
		if (apiRef == null || !api) {
			return;
		}
		const set = (api: SlideNavigatorApi | null) => {
			if (typeof apiRef === "function") {
				apiRef(api);
			} else {
				(apiRef as React.MutableRefObject<SlideNavigatorApi | null>).current = api;
			}
		};
		set(api);
		return () => {
			set(null);
		};
	}, [apiRef, api]);

	const hash = getChildrenHash(children);
	const refHash = React.useRef(hash);

	React.useEffect(() => {
		if (refHash.current !== hash) {
			refHash.current = hash;
			if (api) {
				api.update();
			}
		}
	}, [hash, api]);

	return [ref, api];
};

export { useSlideNavigator };
export type { UseSlideNavigatorOptions };
