import path from "path";
import { runInitConfirm } from "./init";
import { preFlightAdd } from "../preflights/preflight-add";
import { addComponents } from "../utils/add-components";
import * as ERRORS from "../utils/errors";
import { handleError } from "../utils/handle-error";
import { highlighter } from "../utils/highlighter";
import { logger } from "../utils/logger";
import { getRegistryIndex } from "../utils/registry";
import { Command } from "commander";
import prompts from "prompts";
import { z } from "zod";

export const addOptionsSchema = z.object({
	components: z.array(z.string()).optional(),
	yes: z.boolean(),
	overwrite: z.boolean(),
	cwd: z.string(),
	all: z.boolean(),
	path: z.string().optional(),
	silent: z.boolean(),
});

export const add = new Command()
	.name("add")
	.description("add a component to your project")
	.argument("[components...]", "the components to add or a url to the component.")
	.option("-y, --yes", "skip confirmation prompt.", false)
	.option("-o, --overwrite", "overwrite existing files.", false)
	.option("-c, --cwd <cwd>", "the working directory. defaults to the current directory.", process.cwd())
	.option("-a, --all", "add all available components", false)
	.option("-p, --path <path>", "the path to add the component to.")
	.option("-s, --silent", "mute output.", false)
	.action(async (components, opts) => {
		try {
			const options = addOptionsSchema.parse({
				components,
				cwd: path.resolve(opts.cwd),
				...opts,
			});

			if (!options.components?.length) {
				options.components = await promptForRegistryComponents(options);
			}

			let { errors, config } = await preFlightAdd(options);

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

			await addComponents(options.components, config, options);
		} catch (error) {
			logger.break();
			handleError(error);
		}
	});

async function promptForRegistryComponents(options: z.infer<typeof addOptionsSchema>) {
	const registryIndex = getRegistryIndex();
	if (options.all) {
		return registryIndex.map((entry) => entry.name);
	}

	if (options.components?.length) {
		return options.components;
	}

	const { components } = await prompts({
		type: "multiselect",
		name: "components",
		message: "Which components would you like to add?",
		hint: "Space to select. A to toggle all. Enter to submit.",
		instructions: false,
		choices: registryIndex.map((entry) => ({
			title: entry.name,
			value: entry.name,
			selected: options.all ? true : options.components?.includes(entry.name),
		})),
	});

	if (!components?.length) {
		logger.warn("No components selected. Exiting.");
		logger.break();
		process.exit(1);
	}

	const result = z.array(z.string()).safeParse(components);
	if (!result.success) {
		logger.error("");
		handleError(new Error("Something went wrong. Please try again."));
	}

	return result.data;
}
