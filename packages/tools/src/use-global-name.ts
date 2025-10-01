"use client";

import * as React from "react";

const useGlobalName = (value: unknown, globalName: string | boolean | undefined | null, defaultName: string) => {
	React.useEffect(() => {
		if (!globalName || typeof Reflect === "undefined" || typeof window === "undefined") {
			return;
		}
		const key = typeof globalName === "string" ? globalName : defaultName;
		Reflect.defineProperty(window, key, { value: value });
		return () => {
			Reflect.deleteProperty(window, key);
		};
	}, [value, globalName, defaultName]);
};

export { useGlobalName };
