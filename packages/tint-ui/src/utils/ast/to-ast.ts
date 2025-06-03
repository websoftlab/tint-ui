import recast from "recast";
import { parse } from "@babel/parser";

// Split code to AST
export function toAst(code: string): any {
	return recast.parse(code, {
		parser: {
			parse(source: string) {
				return parse(source, {
					sourceType: "module",
					allowReturnOutsideFunction: true,
					startLine: 1,
					tokens: true,
					plugins: ["typescript", "jsx"],
				});
			},
		},
	});
}
