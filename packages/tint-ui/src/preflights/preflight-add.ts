import path from "node:path";
import * as fs from "../utils/fs";
import * as ERRORS from "../utils/errors";
import { getConfig } from "../utils/get-config";
import { highlighter } from "../utils/highlighter";
import { logger } from "../utils/logger";

export async function preFlightAdd(options: { cwd: string }) {
	const errors: Record<string, boolean> = {};

	// Ensure target directory exists.
	// Check for empty project. We assume if no package.json exists, the project is empty.
	if (!(await fs.exists(options.cwd)) || !(await fs.exists(path.resolve(options.cwd, "package.json")))) {
		errors[ERRORS.MISSING_DIR_OR_EMPTY_PROJECT] = true;
		return {
			errors,
			config: null,
		};
	}

	// Check for existing components.json file.
	if (!(await fs.exists(path.resolve(options.cwd, "components.json")))) {
		errors[ERRORS.MISSING_CONFIG] = true;
		return {
			errors,
			config: null,
		};
	}

	try {
		const config = await getConfig(options.cwd);

		return {
			errors,
			config: config!,
		};
	} catch (error) {
		logger.break();
		logger.error(
			`An invalid ${highlighter.info("components.json")} file was found at ${highlighter.info(
				options.cwd
			)}.\nBefore you can add components, you must create a valid ${highlighter.info(
				"components.json"
			)} file by running the ${highlighter.info("init")} command.`
		);
		logger.break();
		process.exit(1);
	}
}
