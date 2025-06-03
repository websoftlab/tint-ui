#!/usr/bin/env node
import { add } from "./commands/add";
import { info } from "./commands/info";
import { init } from "./commands/init";
import { create } from "./commands/create";
import { handleError } from "./utils/handle-error";
import { Command } from "commander";

process.on("SIGINT", () => process.exit(0));
process.on("SIGTERM", () => process.exit(0));

async function main() {
	return new Command()
		.name("tint-ui")
		.description("add components and dependencies to your project")
		.version("1.0.0", "-v, --version", "display the version number")
		.addCommand(init)
		.addCommand(add)
		.addCommand(create)
		.addCommand(info)
		.parseAsync();
}

main().catch((err) => {
	handleError(err);
});
