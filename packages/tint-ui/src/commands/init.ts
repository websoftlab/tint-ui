import { promises as fs } from "fs";
import path from "path";
import { preFlightInit } from "../preflights/preflight-init";
import { addComponents } from "../utils/add-components";
import * as ERRORS from "../utils/errors";
import {
	DEFAULT_COMPONENTS,
	DEFAULT_TAILWIND_CONFIG,
	DEFAULT_TAILWIND_CSS,
	getConfig,
	rawConfigSchema,
	resolveConfigPaths,
	type Config,
	DEFAULT_APP,
} from "../utils/get-config";
import { getProjectConfig, getProjectInfo, ProjectInfo } from "../utils/get-project-info";
import { handleError } from "../utils/handle-error";
import { highlighter } from "../utils/highlighter";
import { logger } from "../utils/logger";
import { getRegistryBaseColors, getRegistryModes } from "../utils/registry";
import { spinner } from "../utils/spinner";
import { Command } from "commander";
import prompts from "prompts";
import { z } from "zod";
import { updateApp } from "../utils/update-app";
import { updateTailwindContent } from "../utils/updaters/update-tailwind-content";

export const initOptionsSchema = z.object({
	cwd: z.string(),
	components: z.array(z.string()).optional(),
	yes: z.boolean(),
	defaults: z.boolean(),
	overwrite: z.boolean(),
	silent: z.boolean(),
});

export const init = new Command()
	.name("init")
	.description("initialize your project and install dependencies")
	.argument("[components...]", "the components to add or a url to the component.")
	.option("-y, --yes", "skip confirmation prompt.", true)
	.option("-d, --defaults,", "use default configuration.", false)
	.option("-f, --overwrite", "overwrite of existing configuration.", false)
	.option("-c, --cwd <cwd>", "the working directory. defaults to the current directory.", process.cwd())
	.option("-s, --silent", "mute output.", false)
	.action(async (components, opts) => {
		try {
			const options = initOptionsSchema.parse({
				cwd: path.resolve(opts.cwd),
				components,
				...opts,
			});

			await runInit(options);

			logger.log(
				`${highlighter.success("Success!")} Project initialization completed.\nYou may now add components.`
			);
			logger.break();
		} catch (error) {
			logger.break();
			handleError(error);
		}
	});

export async function runInitConfirm(options: { cwd: string }) {
	const { proceed } = await prompts({
		type: "confirm",
		name: "proceed",
		message: `You need to create a ${highlighter.info("components.json")} file to add components. Proceed?`,
		initial: true,
	});

	if (!proceed) {
		logger.break();
		process.exit(1);
	}

	return runInit({
		cwd: options.cwd,
		yes: true,
		overwrite: true,
		defaults: false,
		skipPreflight: false,
		silent: true,
	});
}

export async function runInit(
	options: z.infer<typeof initOptionsSchema> & {
		skipPreflight?: boolean;
	}
) {
	let projectInfo: ProjectInfo | null;
	if (!options.skipPreflight) {
		const preflight = await preFlightInit(options);
		if (preflight.errors[ERRORS.MISSING_DIR_OR_EMPTY_PROJECT]) {
			handleError("Project not found.");
		}
		projectInfo = preflight.projectInfo;
	} else {
		projectInfo = await getProjectInfo(options.cwd);
	}

	const projectConfig = await getProjectConfig(options.cwd, projectInfo);
	const config = projectConfig
		? await promptForMinimalConfig(projectConfig, options)
		: await promptForConfig(await getConfig(options.cwd));

	if (!options.yes) {
		const { proceed } = await prompts({
			type: "confirm",
			name: "proceed",
			message: `Write configuration to ${highlighter.info("components.json")}. Proceed?`,
			initial: true,
		});

		if (!proceed) {
			process.exit(0);
		}
	}

	// Write components.json.
	const componentSpinner = spinner(`Writing components.json.`).start();
	const targetPath = path.resolve(options.cwd, "components.json");
	await fs.writeFile(targetPath, JSON.stringify(config, null, 2), "utf-8");
	componentSpinner.succeed();

	const fullConfig = await resolveConfigPaths(options.cwd, config);
	if (projectInfo?.framework.name === "phragon") {
		await updateTailwindContent(["./src-client/**/*.{js,ts,jsx,tsx,mdx}"], fullConfig, {
			silent: options.silent,
		});
	}

	// Create base.
	try {
		await updateApp(fullConfig);
	} catch (err) {
		handleError(err);
	}

	// Add components.
	const components = [...(options.components || [])];
	await addComponents(components, fullConfig, {
		// Init will always overwrite files.
		overwrite: true,
		initialize: true,
		silent: options.silent,
	});

	return fullConfig;
}

async function promptForConfig(defaultConfig: Config | null = null) {
	const [modes, baseColors] = [getRegistryModes(), getRegistryBaseColors()];

	logger.break();
	const options = await prompts([
		{
			type: "toggle",
			name: "typescript",
			message: `Would you like to use ${highlighter.info("TypeScript")} (recommended)?`,
			initial: defaultConfig?.ts ?? true,
			active: "yes",
			inactive: "no",
		},
		{
			type: "select",
			name: "mode",
			message: `Which ${highlighter.info("mode")} would you like to use?`,
			choices: modes.map((mode) => ({
				title: mode.label,
				value: mode.name,
			})),
		},
		{
			type: "select",
			name: "tailwindBaseColor",
			message: `Which color would you like to use as the ${highlighter.info("base color")}?`,
			choices: baseColors.map((color) => ({
				title: color.label,
				value: color.name,
			})),
		},
		{
			type: "text",
			name: "tailwindCss",
			message: `Where is your ${highlighter.info("global CSS")} file?`,
			initial: defaultConfig?.tailwind.css ?? DEFAULT_TAILWIND_CSS,
		},
		{
			type: "toggle",
			name: "tailwindCssVariables",
			message: `Would you like to use ${highlighter.info("CSS variables")} for theming?`,
			initial: defaultConfig?.tailwind.cssVariables ?? true,
			active: "yes",
			inactive: "no",
		},
		{
			type: "text",
			name: "tailwindPrefix",
			message: `Are you using a custom ${highlighter.info("tailwind prefix eg. tw-")}? (Leave blank if not)`,
			initial: "",
		},
		{
			type: "text",
			name: "tailwindConfig",
			message: `Where is your ${highlighter.info("tailwind.config.js")} located?`,
			initial: defaultConfig?.tailwind.config ?? DEFAULT_TAILWIND_CONFIG,
		},
		{
			type: "text",
			name: "components",
			message: `Configure the import alias for ${highlighter.info("components")}:`,
			initial: defaultConfig?.aliases["components"] ?? DEFAULT_COMPONENTS,
		},
	]);

	const { app } = await prompts({
		type: "text",
		name: "app",
		message: `Configure the import alias for ${highlighter.info("app")}:`,
		initial: (defaultConfig?.path["app"] ?? DEFAULT_APP) + (options.typescript ? ".tsx" : ".jsx"),
	});

	return rawConfigSchema.parse({
		mode: options.mode,
		tailwind: {
			config: options.tailwindConfig,
			css: options.tailwindCss,
			baseColor: options.tailwindBaseColor,
			cssVariables: options.tailwindCssVariables,
			prefix: options.tailwindPrefix,
		},
		ts: options.typescript,
		path: {
			app,
		},
		aliases: {
			components: options.components,
		},
	});
}

async function promptForMinimalConfig(defaultConfig: Config, opts: z.infer<typeof initOptionsSchema>) {
	let mode = defaultConfig.mode;
	let baseColor = defaultConfig.tailwind.baseColor;
	let cssVariables = defaultConfig.tailwind.cssVariables;

	if (!opts.defaults) {
		const [modes, baseColors] = [getRegistryModes(), getRegistryBaseColors()];

		const options = await prompts([
			{
				type: "select",
				name: "mode",
				message: `Which ${highlighter.info("mode")} would you like to use?`,
				choices: modes.map((mode) => ({
					title: mode.label,
					value: mode.name,
				})),
				initial: modes.findIndex((s) => s.name === mode),
			},
			{
				type: "select",
				name: "tailwindBaseColor",
				message: `Which color would you like to use as the ${highlighter.info("base color")}?`,
				choices: baseColors.map((color) => ({
					title: color.label,
					value: color.name,
				})),
			},
			{
				type: "toggle",
				name: "tailwindCssVariables",
				message: `Would you like to use ${highlighter.info("CSS variables")} for theming?`,
				initial: defaultConfig?.tailwind.cssVariables,
				active: "yes",
				inactive: "no",
			},
		]);

		mode = options.mode;
		baseColor = options.tailwindBaseColor;
		cssVariables = options.tailwindCssVariables;
	}

	return rawConfigSchema.parse({
		mode: mode,
		tailwind: {
			...defaultConfig?.tailwind,
			baseColor,
			cssVariables,
		},
		path: {
			app: defaultConfig?.path?.app,
		},
		ts: defaultConfig?.ts,
		aliases: defaultConfig?.aliases,
	});
}
