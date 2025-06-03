import path from "path";
import { highlighter } from "../utils/highlighter";
import { logger } from "../utils/logger";
import fs from "fs-extra";
import { z } from "zod";
import { createOptionsSchema } from "../commands/create";
import { preFlightAdd } from "./preflight-add";
import { hasRegistryComponent } from "../utils/registry";
import prompts from "prompts";

const hasName = (name: string) =>
	name.length > 0 && name.length < 50 && /^[a-z][a-z\d\-]+$/.test(name) && !/-(\d|-|$)/.test(name);

export async function preFlightCreate(options: z.infer<typeof createOptionsSchema>) {
	const result = await preFlightAdd(options);
	const { config } = result;
	if (config == null) {
		return { ...result, components: [] };
	}

	const { names } = options;
	const components: string[] = [];
	for (const name of names) {
		const dirName = path.resolve(config.resolvedPaths.components, name);
		if (name === "theme" || name === "index") {
			logger.warn(`The \`${highlighter.info(name)}\` component name is private`);
		} else if (!hasName(name)) {
			logger.warn(`Invalid component name \`${highlighter.info(name)}\``);
		} else if (fs.existsSync(dirName)) {
			logger.warn(`The \`${highlighter.info(name)}\` component path is already exists`);
		} else if (hasRegistryComponent(name)) {
			const { yes } = await prompts({
				type: "confirm",
				name: "yes",
				message: `The \`${highlighter.info(
					name
				)}\` component is a system component. Are you sure you want to create a new component with this name? To add the component, you can use the command: ${highlighter.info(
					`tint-ui add ${name}`
				)}`,
				initial: true,
			});
			if (yes) {
				components.push(name);
			}
		} else {
			components.push(name);
		}
	}

	return {
		config,
		components,
		errors: result.errors,
	};
}
