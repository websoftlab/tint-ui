import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import axios from "axios";
import { readFile } from "./fs";

export async function loadPackageFile(file: string): Promise<string> {
	let url: string;

	if (typeof require === "function") {
		url = require.resolve(file);
	} else {
		try {
			url = import.meta.resolve(file);
		} catch (err) {
			if (err instanceof Error && err.message.includes("resolve is not a function")) {
				url = createRequire(import.meta.url).resolve(file);
			} else {
				throw err;
			}
		}
	}

	if (/^https?:\/\//.test(url)) {
		const { status, statusText, data } = await axios.get<string>(url, {
			validateStatus() {
				return true;
			},
		});
		if (String(status).startsWith("20")) {
			return data;
		}
		if (status === 404) {
			throw new Error(
				`The style at ${file} was not found. \nIt may not exist at the registry. Please make sure it is a valid component.`
			);
		}
		throw new Error(`Can't read style at ${file}: ${status} ${statusText}`);
	}

	if (url.startsWith("file:")) {
		url = fileURLToPath(url);
	}

	return readFile(url);
}
