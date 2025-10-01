import { access, lstat, readFile as readFileNative, writeFile as writeFileNative } from "node:fs/promises";
import { constants } from "node:fs";
import stripJsonComments from "strip-json-comments";

const readFile = async function (file: string): Promise<string> {
	const isFile = await fileExists(file);
	if (!isFile) {
		throw new Error(`File not found: ${file}`);
	}
	return readFileNative(file, "utf-8");
};

const writeFile = async function (file: string, data: string): Promise<void> {
	await writeFileNative(file, data, "utf-8");
};

const readJson = async function <T = object>(file: string): Promise<T> {
	const isFile = await fileExists(file);
	if (!isFile) {
		throw new Error(`JSON file not found: ${file}`);
	}
	let data = await readFileNative(file, "utf-8");
	data = stripJsonComments(data).trim();
	if (data.length === 0 || data === "null") {
		throw new Error(`JSON file is empty: ${file}`);
	}
	return JSON.parse(data) as T;
};

const writeJson = async function <T extends object = object>(file: string, data: T): Promise<void> {
	await writeFile(file, JSON.stringify(data, null, "\t"));
};

const exists = async (file: string) => {
	try {
		await access(file, constants.F_OK);
	} catch (err) {
		return false;
	}
	return true;
};

const fileExists = async (file: string) => {
	const test = await exists(file);
	if (!test) {
		return false;
	}
	const info = await lstat(file);
	return info.isFile();
};

const pathExists = async (file: string) => {
	const test = await exists(file);
	if (!test) {
		return false;
	}
	const info = await lstat(file);
	return info.isDirectory();
};

export { exists, fileExists, pathExists, readFile, writeFile, readJson, writeJson };
