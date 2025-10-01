import type { PackageJson } from "type-fest";

import path from "node:path";
import { readJson } from "./fs";
import { logger } from "./logger";

export async function getPackageInfo(cwd: string = "", shouldThrow: boolean = true): Promise<PackageJson | null> {
	const packageJsonPath = path.join(cwd, "package.json");

	try {
		return await readJson<PackageJson>(packageJsonPath);
	} catch (err) {
		if (shouldThrow) {
			throw err;
		}
		logger.error(err);
	}

	return null;
}
