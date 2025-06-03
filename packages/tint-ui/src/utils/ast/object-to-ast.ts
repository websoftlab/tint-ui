import recast from "recast";

const b = recast.types.builders;

export function objectToAst(json: any): any {
	if (json == null) {
		return typeof json === "undefined" ? b.identifier("undefined") : b.nullLiteral();
	}
	if (Array.isArray(json)) {
		return b.arrayExpression(json.map(objectToAst));
	}
	switch (typeof json) {
		case "object":
			return b.objectExpression(
				Object.entries(json).map(([key, value]) => b.objectProperty(b.stringLiteral(key), objectToAst(value)))
			);
		case "string":
			return b.stringLiteral(json);
		case "number":
			return b.numericLiteral(json);
		case "boolean":
			return b.booleanLiteral(json);
	}
	throw new Error(`Unsupported object value: ${json}`);
}
