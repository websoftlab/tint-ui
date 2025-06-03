import { Config } from "../get-config";
import { getPackageInfo } from "../get-package-info";
import { getPackageManager } from "../get-package-manager";
import { logger } from "../logger";
import { spinner } from "../spinner";
import { execa } from "execa";
import prompts from "prompts";

export async function updateDependencies(
	dependencies: string[] | undefined,
	config: Config,
	options: {
		silent?: boolean;
	}
) {
	if (!Array.isArray(dependencies) || !dependencies.length) {
		return;
	}

	options = {
		silent: false,
		...options,
	};

	const dependenciesSpinner = spinner(`Installing dependencies.`, {
		silent: options.silent,
	})?.start();
	const packageManager = await getPackageManager(config.resolvedPaths.cwd);

	// Offer to use --overwrite or --legacy-peer-deps if using React 19 with npm.
	let flag = "";
	if (isUsingReact19(config) && packageManager === "npm") {
		dependenciesSpinner.stopAndPersist();
		logger.warn(
			"\nIt looks like you are using React 19. \nSome packages may fail to install due to peer dependency issues in npm.\n"
		);
		const confirmation = await prompts([
			{
				type: "select",
				name: "flag",
				message: "How would you like to proceed?",
				choices: [
					{ title: "Use --overwrite", value: "overwrite" },
					{ title: "Use --legacy-peer-deps", value: "legacy-peer-deps" },
				],
			},
		]);

		if (confirmation) {
			flag = confirmation.flag;
		}
	}

	dependenciesSpinner?.start();

	await execa(
		packageManager,
		[
			packageManager === "npm" ? "install" : "add",
			...(packageManager === "npm" && flag ? [`--${flag}`] : []),
			...dependencies,
		],
		{
			cwd: config.resolvedPaths.cwd,
		}
	);
	dependenciesSpinner?.succeed();
}

function isUsingReact19(config: Config) {
	const packageInfo = getPackageInfo(config.resolvedPaths.cwd);

	if (!packageInfo?.dependencies?.react) {
		return false;
	}

	return /^(?:^|~)?19(?:\.\d+)*(?:-.*)?$/.test(packageInfo.dependencies.react);
}
