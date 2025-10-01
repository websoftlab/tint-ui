import { readFile } from "../fs";
import { toAst } from "./to-ast";

// Split code to AST from file
export async function fileToAst(file: string): Promise<any> {
	return toAst(await readFile(file));
}
