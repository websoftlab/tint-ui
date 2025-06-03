import recast from "recast";

export function addImportAst(ast: any, name: string, from: string, isDefault = true) {
	// check import
	const type = isDefault ? "ImportDefaultSpecifier" : "ImportSpecifier";
	const isImportExists = ast.program.body.some(
		(node: { type: string; source: { value: string }; specifiers: { type: string; local: { name: string } }[] }) =>
			node.type === "ImportDeclaration" &&
			node.source.value === from &&
			node.specifiers.some((specifier) => specifier.type === type && specifier.local.name === name)
	);

	if (isImportExists) {
		return false;
	}

	const b = recast.types.builders;
	const newImport = b.importDeclaration(
		[(isDefault ? b.importDefaultSpecifier : b.importSpecifier)(b.identifier(name))],
		b.stringLiteral(from)
	);

	// Find last import
	let lastImportIndex = -1;
	ast.program.body.forEach((node: { type: string }, index: number) => {
		if (node?.type === "ImportDeclaration") {
			lastImportIndex = index;
		}
	});

	// Inject new import
	if (lastImportIndex !== -1) {
		ast.program.body[lastImportIndex].loc = null;
		ast.program.body.splice(lastImportIndex + 1, 0, newImport);
	} else {
		ast.program.body.unshift(newImport);
	}

	return true;
}
