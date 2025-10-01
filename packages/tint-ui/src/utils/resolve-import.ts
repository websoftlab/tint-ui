import type { ConfigLoaderSuccessResult } from "tsconfig-paths";

import { createMatchPath } from "tsconfig-paths";
import * as process from "node:process";
import path from "node:path";

const readPath = (src: undefined | string | string[], segments: string[] = []) => {
	if (Array.isArray(src)) {
		src = src[0];
	}
	if (typeof src !== "string" || !src.endsWith("/*")) {
		return null;
	}
	src = src.slice(0, -2);
	if (segments.length) {
		src += "/" + segments.join("/");
	}
	return src;
};

export async function resolveImport(
	importPath: string,
	config: Pick<ConfigLoaderSuccessResult, "absoluteBaseUrl" | "paths">
) {
	const { paths = {}, absoluteBaseUrl } = config;
	let cwd = absoluteBaseUrl;
	if (!cwd) {
		cwd = process.cwd();
	}

	const segments = (importPath.endsWith("/") ? importPath.slice(0, -1) : importPath).split("/");
	const remap: { src: string; segments: string[] }[] = [];

	let pref = "";
	while (segments.length > 0) {
		const first = segments.shift() as string;
		pref += `${first}/`;
		remap.push({ src: `${pref}*`, segments: segments.slice() });
	}

	remap.reverse();
	for (const map of remap) {
		const src = readPath(paths[map.src], map.segments);
		if (src) {
			return path.join(cwd, src);
		}
	}

	return createMatchPath(config.absoluteBaseUrl, config.paths)(importPath, undefined, () => true, [".ts", ".tsx"]);
}
