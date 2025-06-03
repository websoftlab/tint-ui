import type { Config } from "./get-config";
import { handleError } from "./handle-error";
import { logger } from "./logger";
import { registryResolveItemsTree } from "./registry";
import { spinner } from "./spinner";
import { updateCssVars } from "./updaters/update-css-vars";
import { updateDependencies } from "./updaters/update-dependencies";
import { updateTailwindConfig } from "./updaters/update-tailwind-config";
import { updateComponents } from "./updaters/update-components";
import { updateIcons } from "./updaters/update-icons";

export async function addComponents(
	components: string[],
	config: Config,
	options: {
		overwrite?: boolean;
		silent?: boolean;
		initialize?: boolean;
	}
) {
	options = {
		overwrite: false,
		silent: false,
		initialize: false,
		...options,
	};

	const registrySpinner = spinner(`Checking registry.`, {
		silent: options.silent,
	}).start();
	const tree = registryResolveItemsTree(components, config, options.initialize);
	if (!tree) {
		registrySpinner.fail();
		return handleError(new Error("Failed to fetch components from registry."));
	}
	registrySpinner.succeed();

	await updateTailwindConfig(tree.tailwind?.config, config, {
		silent: options.silent,
	});

	await updateCssVars(tree.cssVars, config, {
		silent: options.silent,
	});

	await updateDependencies(tree.dependencies, config, {
		silent: options.silent,
	});

	await updateComponents(tree.components, config, {
		silent: options.silent,
		overwrite: options.overwrite,
	});

	await updateIcons(tree.icons, config, {
		silent: options.silent,
	});

	if (tree.docs) {
		logger.info(tree.docs);
	}
}
