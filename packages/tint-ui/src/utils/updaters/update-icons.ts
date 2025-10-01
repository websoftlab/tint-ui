import type { Config } from "../get-config";
import type { RegistryIconSchema } from "../registry/types";

import path from "node:path";
import recast from "recast";
import { writeFile } from "../fs";
import { handleError } from "../handle-error";
import { spinner } from "../spinner";
import { fileToAst } from "../ast/file-to-ast";
import { getRegistryIcons } from "../registry";
import { objectToAst } from "../ast/object-to-ast";
import { addImportAst } from "../ast/add-import-ast";

const rebuild = (ast: any, newIcons: RegistryIconSchema[]) => {
	const b = recast.types.builders;
	const createSvgIcon = "createSvgIcon";

	let found = false;
	let updated = false;

	// Add new icon to `icons`
	recast.visit(ast, {
		visitVariableDeclaration(path) {
			const { node } = path;
			node.declarations.forEach((declaration) => {
				if (
					declaration.type === "VariableDeclarator" &&
					declaration.id.type === "Identifier" &&
					declaration.id.name === "icons" &&
					declaration.init?.type === "ObjectExpression"
				) {
					found = true;
					declaration.init.properties.forEach((prop) => {
						if (prop.type === "ObjectProperty") {
							let name: string;
							if (prop.key.type === "Identifier") {
								name = prop.key.name;
							} else if (prop.key.type === "StringLiteral") {
								name = prop.key.value;
							} else {
								return;
							}
							const index = newIcons.findIndex((item) => item.name === name);
							if (index !== -1) {
								newIcons.splice(index, 1);
							}
						}
					});

					if (!newIcons.length) {
						return;
					}

					updated = true;

					const { properties } = declaration.init;
					newIcons.forEach(({ name, type, data }) => {
						properties.push(
							b.objectProperty(
								b.stringLiteral(name),
								b.callExpression(b.identifier(createSvgIcon), [
									b.stringLiteral(name),
									b.stringLiteral(type),
									objectToAst(data),
								])
							)
						);
					});
				}
			});
			this.traverse(path);
		},
	});

	if (!found) {
		throw new Error("The `icons` variable was not found in the theme file or variable is not plain object");
	}

	if (addImportAst(ast, createSvgIcon, "@tint-ui/svg-icon", false)) {
		return true;
	}

	return updated;
};

export async function updateIcons(
	icons: string[] | undefined,
	config: Config,
	options: {
		silent?: boolean;
	}
) {
	if (!Array.isArray(icons) || icons.length === 0) {
		return;
	}

	const newIcons = getRegistryIcons(icons);
	if (!newIcons.length) {
		return;
	}

	const themeFile = path.resolve(config.resolvedPaths.components, `theme/index.${config.ts ? "tsx" : "jsx"}`);
	const iconSpinner = spinner(`Installing icons: ${newIcons.map((item) => item.name).join(", ")}.`, {
		silent: options.silent,
	});

	try {
		const ast = await fileToAst(themeFile);
		if (!rebuild(ast, newIcons)) {
			return;
		}

		// Generate new source and write
		iconSpinner.start();
		await writeFile(themeFile, recast.print(ast).code);
		iconSpinner.succeed();
	} catch (error) {
		if (iconSpinner.isSpinning) {
			iconSpinner.fail();
		}
		handleError(error);
	}
}
