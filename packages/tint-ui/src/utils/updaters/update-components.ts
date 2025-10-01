import type { Config } from "../get-config";

import path from "node:path";
import { mkdir } from "node:fs/promises";
import recast from "recast";
import * as fs from "../fs";
import { handleError } from "../handle-error";
import { spinner } from "../spinner";
import { loadPackageFile } from "../load-package-file";
import { fileToAst } from "../ast/file-to-ast";
import { addImportAst } from "../ast/add-import-ast";
import { updateTheme } from "../update-theme";

export interface UpdateComponentOptions {
	name: string;
	module: string;
	getCssSource: (pathName: string) => Promise<string> | string;
	getComponentSource: () => Promise<string> | string;
	overwrite?: boolean;
	withStyles?: boolean;
}

const write = async (file: string, data: string) => {
	const dir = path.dirname(file);
	if (!(await fs.exists(dir))) {
		await mkdir(dir, { recursive: true });
	}
	await fs.writeFile(file, data);
};

export async function updateComponent(
	config: Config,
	{ name, module, withStyles, getCssSource, getComponentSource, overwrite }: UpdateComponentOptions
) {
	const { mode, ts: isTs } = config;
	if (name === "theme") {
		return updateTheme(config);
	}

	const componentPath = config.resolvedPaths.components;
	const componentFile = path.resolve(componentPath, `${name}/index.${isTs ? "ts" : "js"}`);

	if (overwrite || !(await fs.exists(componentFile))) {
		await write(componentFile, await getComponentSource());
	}

	if (!withStyles) {
		return;
	}

	// Example:
	// { "template": "data-table.module.scss", "name": "styles", "classes": "classes" }
	// { "template": "data-table-filter.module.scss", "name": "styles-filter", "classes": "filterClasses" }

	type StyleType = {
		template: string;
		name: string;
		classes: string;
	};

	const updateStyle = async (style: StyleType) => {
		let { template } = style;
		if (mode === "css") {
			template = template.replace(/\.scss$/, ".css");
		}

		const styleFilename = `${style.name}.module.${mode === "sass" ? "scss" : "css"}`;
		const styleFile = path.resolve(componentPath, `${name}/${template}`);
		const styleName = style.name.replace("styles", name);
		const classesName = `${styleName.replace(/-(.)/g, (_, v) => v.toUpperCase())}Classes`;
		const localStyleFile = `${config.aliases.components}/${name}/${template}`;
		const themeFile = path.resolve(componentPath, `theme/index.${isTs ? "tsx" : "jsx"}`);

		if (overwrite || !(await fs.exists(styleFile))) {
			await write(styleFile, await getCssSource(`${module}/${styleFilename}`));
		}
		const ast = await fileToAst(themeFile);
		const b = recast.types.builders;

		let found = false;
		let updated = false;

		// Add new object to `classes`
		recast.visit(ast, {
			visitVariableDeclaration(path) {
				const { node } = path;
				node.declarations.forEach((declaration) => {
					if (
						declaration.type === "VariableDeclarator" &&
						declaration.id.type === "Identifier" &&
						declaration.id.name === "classes" &&
						declaration.init?.type === "ObjectExpression"
					) {
						found = true;
						const index = declaration.init.properties.findIndex((prop) => {
							if (prop.type === "ObjectProperty") {
								if (prop.key.type === "Identifier") {
									return styleName === prop.key.name;
								} else if (prop.key.type === "StringLiteral") {
									return styleName === prop.key.value;
								}
							}
							return false;
						});

						if (index === -1) {
							declaration.init.properties.push(
								b.objectProperty(b.stringLiteral(styleName), b.identifier(classesName))
							);
						} else if (overwrite) {
							declaration.init.properties[index] = b.objectProperty(
								b.stringLiteral(styleName),
								b.identifier(classesName)
							);
						} else {
							return;
						}

						updated = true;
					}
				});
				this.traverse(path);
			},
		});

		if (!found) {
			throw new Error("The `classes` variable was not found in the theme file or variable is not plain object");
		}

		if (!updated) {
			return;
		}

		// create new class import
		addImportAst(ast, classesName, localStyleFile);

		// Generate new source and write
		let code = recast.print(ast).code;

		while (true) {
			code = code.trimStart();
			if (code.charAt(0) === ";") {
				code = code.substring(1);
				continue;
			}
			const startUse = code.substring(0, 12).toLowerCase();
			if (!["'use client'", '"use client"', "`use client`"].includes(startUse)) {
				break;
			}
			code = code.substring(12);
		}

		await fs.writeFile(themeFile, `"use client";\n\n` + code);
	};

	const styles: StyleType[] = [];
	try {
		const text = await loadPackageFile(`${module}/styles.json`);
		const data = JSON.parse(text) as { styles: StyleType[] };
		if (Array.isArray(data.styles)) {
			styles.push(...data.styles);
		}
	} catch (err) {
		styles.push({ template: `${name}.module.scss`, name: "styles", classes: "classes" });
	}

	for (const style of styles) {
		await updateStyle(style);
	}
}

export async function createNewComponent(
	name: string,
	config: Config,
	options: {
		silent?: boolean;
		overwrite?: boolean;
	}
) {
	const { overwrite = false, silent } = options;
	const isTs = config.ts;
	const camelName = name.replace(/-(.)/g, (_, id) => id.toUpperCase());
	const Name = camelName.charAt(0).toUpperCase() + camelName.substring(1);
	const componentFile = path.resolve(config.resolvedPaths.components, `${name}/${name}${isTs ? ".tsx" : ".jsx"}`);
	const componentClassesFile = path.resolve(
		config.resolvedPaths.components,
		`${name}/${name === "classes" ? "use-classes" : "classes"}${isTs ? ".ts" : ".js"}`
	);
	const componentIndexFile = path.resolve(config.resolvedPaths.components, `${name}/index${isTs ? ".ts" : ".js"}`);
	const componentSpinner = spinner(`Create component ${name}.`, { silent }).start();

	try {
		if (overwrite || !(await fs.exists(componentFile))) {
			const classesCode = `import { classGroup } from "@tint-ui/tools/class-group";
import { useClasses } from "@tint-ui/theme";

const { base } = classGroup("${name}");
const classes = {
	"${camelName}": base
};

const use${Name}Classes = () => useClasses("${name}", classes);${
				isTs
					? `

type ${Name}ClassesType = keyof typeof classes;

type ${Name}Classes = Record<${Name}ClassesType, string>;`
					: ``
			}

export { classes, use${Name}Classes };${isTs ? `\nexport type { ${Name}ClassesType, ${Name}Classes };` : ``}
`;
			const code = `"use client";

import * as React from "react";
import clsx from "clsx";
import { use${Name}Classes } from "./${name === "classes" ? "use-classes" : "classes"}";${
				isTs ? `\n\nexport interface ${Name}Props extends React.HTMLAttributes<HTMLDivElement> {}` : ``
			}

export const ${Name} = React.forwardRef${
				isTs ? `<HTMLDivElement, ${Name}Props>` : ``
			}(({ className, ...rest }, ref) => {
	const classes = use${Name}Classes();
	return (
		<div {...rest} className={clsx(className, classes.${camelName})} ref={ref} />
	);
});
`;
			await write(componentClassesFile, classesCode);
			await write(componentFile, code);
			await write(componentIndexFile, `export * from "./${name}";\n`);
		}

		await updateComponent(config, {
			name,
			module: config.aliases.components + "/" + name,
			withStyles: true,
			overwrite,
			getCssSource() {
				return `.${camelName} {\n\t@apply relative;\n}\n`;
			},
			getComponentSource() {
				return `export * from "${module}";\n`;
			},
		});

		componentSpinner.succeed();
	} catch (error) {
		componentSpinner.fail();
		handleError(error);
	}
}

export async function updateComponents(
	components: { name: string; module: string; withStyles?: boolean }[],
	config: Config,
	options: {
		silent?: boolean;
		overwrite?: boolean;
	}
) {
	for (const { name, module, withStyles } of components) {
		const componentSpinner = spinner(`Installing component ${name}.`, { silent: options.silent }).start();
		try {
			await updateComponent(config, {
				name,
				module,
				withStyles,
				overwrite: options.overwrite,
				getCssSource(pathName: string) {
					return loadPackageFile(pathName);
				},
				getComponentSource() {
					return `export * from "${module}";\n`;
				},
			});
			componentSpinner.succeed();
		} catch (error) {
			componentSpinner.fail();
			handleError(error);
		}
	}
}
