import { handleError } from "../utils/handle-error";
import { logger } from "../utils/logger";
import { Command } from "commander";
import * as ERRORS from "../utils/errors";
import { z } from "zod";
import path from "path";
import { preFlightCreate } from "../preflights/preflight-create";
import { runInitConfirm } from "./init";
import { highlighter } from "../utils/highlighter";
import { createNewComponent } from "../utils/updaters/update-components";
import { updateDependencies } from "../utils/updaters/update-dependencies";

export const createOptionsSchema = z.object({
	names: z.array(z.string()),
	cwd: z.string(),
	silent: z.boolean(),
	overwrite: z.boolean(),
});

export const create = new Command()
	.name("create")
	.description("create a new empty component to your project")
	.argument("[names...]", "the components to add or a url to the component.")
	.option("-o, --overwrite", "overwrite existing files.", false)
	.option("-c, --cwd <cwd>", "the working directory. defaults to the current directory.", process.cwd())
	.option("-s, --silent", "mute output.", false)
	.action(async (names, opts) => {
		try {
			const options = createOptionsSchema.parse({
				names,
				cwd: path.resolve(opts.cwd),
				...opts,
			});

			await runCreate(options);
		} catch (error) {
			logger.break();
			handleError(error);
		}
	});

async function runCreate(options: z.infer<typeof createOptionsSchema>) {
	let { errors, config, components } = await preFlightCreate(options);

	// No components.json file. Prompt the user to run init.
	if (errors[ERRORS.MISSING_CONFIG]) {
		config = await runInitConfirm({
			cwd: options.cwd,
		});
	}

	if (errors[ERRORS.MISSING_DIR_OR_EMPTY_PROJECT]) {
		throw new Error("Project not found.");
	}

	if (!config) {
		throw new Error(`Failed to read config at ${highlighter.info(options.cwd)}.`);
	}

	if (!components.length) {
		logger.warn("No components selected. Exiting.");
		logger.break();
		process.exit(1);
	}

	const opts = {
		silent: options.silent,
	};

	await updateDependencies(["@tint-ui/tools"], config, opts);
	for (const name of components) {
		await createNewComponent(name, config, opts);
	}
}
