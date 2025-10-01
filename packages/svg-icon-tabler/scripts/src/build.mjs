import axios from "axios";
import path from "path";
import { existsSync } from "fs";
import fs from "fs/promises";
import matter from "gray-matter";
import { config } from "dotenv";
import ora from "ora";
import { svgRead } from "./svg-read.mjs";

const scriptsPath = path.dirname(import.meta.dirname);
const envFilePath = path.join(scriptsPath, ".env");
const basePath = path.dirname(scriptsPath);
const dataPath = path.join(basePath, "icons-data");
const cacheFile = path.join(scriptsPath, "icon-cache.json");
const owner = "tabler";
const repo = "tabler-icons";
const loaded = { version: "1.0.0", failure: false, outline: {}, filled: {}, ignored: { outline: [], filled: [] } };

const getQuery = async (url) => {
	const token = process.env.GIT_TOKEN;
	if (!token) {
		throw new Error("Git token is missing");
	}

	const { data, status, statusText } = await axios.get(url, {
		headers: {
			Accept: "application/vnd.github.v3+json",
			Authorization: "Bearer " + token.trim(),
		},
		validateStatus() {
			return true;
		},
	});

	if ((status / 100) >> 0 === 2) {
		return data;
	}

	if (typeof data === "object" && data != null && "message" in data) {
		throw new Error(data.message);
	}

	throw new Error("Git API failure. " + status + " " + statusText);
};

const writeJsonFile = async (file, data) => {
	await fs.writeFile(file, JSON.stringify(data, null, "\t"), { encoding: "utf-8" });
};

const readJsonFile = async (file) => {
	if (!existsSync(file)) {
		return null;
	}
	const text = await fs.readFile(file, "utf-8");
	if (!text) {
		return null;
	}
	return JSON.parse(text);
};

const cache = await readJsonFile(cacheFile);
if (cache != null) {
	Object.assign(loaded, cache);
}

const parseMatter = (icon) => {
	const { data, content } = matter(icon, { delims: ["<!--", "-->"] });
	return { data, content };
};

const spinner = (text) =>
	ora({
		text,
	});

async function getTablerVersion() {
	const apiPackageJsonUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/package.json`;
	const data = await getQuery(apiPackageJsonUrl);

	if (data == null || typeof data !== "object" || !data.version) {
		throw new Error("Invalid API response, invalid package.json file");
	}

	return data.version;
}

/**
 *
 * @param { "outline" | "filled" } type
 * @returns {Promise<{ name: string; url: string; sha: string }[]>}
 */
async function getIcons(type) {
	const shaUrl = `https://api.github.com/repos/${owner}/${repo}/contents/icons`;
	const data = await getQuery(shaUrl);

	if (!Array.isArray(data)) {
		throw new Error("Invalid API response (1), expected an array");
	}

	const dir = data.find((item) => item.name === type && item.type === "dir");
	if (!dir) {
		throw new Error(`Invalid API response (2), the ${type} type does not exist`);
	}

	const apiUrl = dir.git_url || `https://api.github.com/repos/${owner}/${repo}/git/trees/${dir.sha}`;
	const result = [];
	const treeData = await getQuery(apiUrl);

	if (!Array.isArray(treeData.tree)) {
		throw new Error("Invalid API response (3), expected an array");
	}

	if (treeData.truncated) {
		throw new Error("Invalid API response (3), response too long");
	}

	for (const item of treeData.tree) {
		if (item.type === "blob" && String(item.path).endsWith(".svg")) {
			result.push({
				name: item.path.slice(0, -4),
				url: item.url,
				sha: item.sha,
				size: item.size,
			});
		}
	}

	return result;
}

async function getIconData(icon) {
	const data = await getQuery(icon.url);
	if (data == null || typeof data !== "object" || typeof data.content !== "string" || data.encoding !== "base64") {
		throw new Error(`Invalid API response (1) for the ${icon.name} icon`);
	}
	let text;
	try {
		const buffer = Buffer.from(data.content, "base64");
		text = buffer.toString();
	} catch (error) {
		throw new Error(`Invalid API response (2) for the ${icon.name} icon`);
	}
	return parseMatter(text);
}

async function updateTypes(json) {
	const bundleFile = path.join(basePath, "bundle.json");
	const bundle = await readJsonFile(bundleFile);
	if (bundle == null || !Array.isArray(bundle.src)) {
		return;
	}

	const types = bundle.src.find((item) => item.target === "types");
	if (!types) {
		return;
	}

	if (!types["package.json"]) {
		types["package.json"] = {};
	}

	types["package.json"].exports = {
		".": {
			require: "./cjs/index.js",
			default: "./index.js",
		},
	};

	json = [...json, "package.json"];
	for (const file of json) {
		const filePath = "./" + file;
		types["package.json"].exports[filePath] = { require: filePath, default: filePath };
	}

	await writeJsonFile(bundleFile, bundle);
}

async function updatePackageJson(json, version) {
	const bundleFile = path.join(basePath, "bundle-version.json");
	let bundleData = await readJsonFile(bundleFile);
	if (bundleData == null) {
		bundleData = {
			version,
			ignoreChannel: [],
			release: {},
		};
	} else if (bundleData.version !== version) {
		bundleData.nextVersion = version;
	}

	await writeJsonFile(bundleFile, bundleData);

	const packageFile = path.join(basePath, "package.json");
	const data = await readJsonFile(packageFile);
	if (data == null) {
		throw new Error("Invalid package.json project file");
	}

	data.version = version;
	if (!data.exports) {
		data.exports = {};
	}
	data.exports["."] = {
		require: "./build/cjs/index.js",
		default: "./build/index.js",
	};
	json = [...json, "package.json"];
	for (const file of json) {
		const key = `./${file}`;
		const value = `./icons-data/${file}`;
		data.exports[key] = { require: value, default: value };
	}

	await writeJsonFile(packageFile, data);
}

async function clearOldData(json) {
	const files = await fs.readdir(dataPath, { withFileTypes: true });
	for (const file of files) {
		if (!file.isFile()) {
			continue;
		}
		const name = file.name;
		if (name.endsWith(".json") && !json.includes(name)) {
			await fs.unlink(path.join(dataPath, name));
		}
	}
}

if (existsSync(envFilePath)) {
	config({ path: envFilePath });
}

if (!existsSync(dataPath)) {
	await fs.mkdir(dataPath);
}

let updated = false;
if (loaded.failure) {
	updated = true;
	loaded.failure = false;
}

const version = await getTablerVersion();
if (version !== loaded.version) {
	loaded.version = version;
	updated = true;
	console.log(`$ Tablerabler version ${version} (new)`);
} else {
	console.log(`$ Tabler version ${version}`);
}

const fatal = async (name, message) => {
	console.log(`$ Parse ${name} icon failure:`, message);
	loaded.failure = true;
	await writeJsonFile(cacheFile, loaded);
	process.exit(1);
};

for (const type of ["outline", "filled"]) {
	console.log(`$ Load ${type} icons`);
	const icons = await getIcons(type);
	console.log(`$ Founded ${icons.length} icon(s)`);

	const info = loaded[type];
	const spin = spinner("Load and parse icons...").start();
	const filled = type === "filled";
	const length = icons.length;

	for (let i = 0, retry = 1; i < length; i++) {
		const icon = icons[i];
		const { name, sha, size } = icon;

		if (info[name] && info[name].sha === sha && info[name].size === size) {
			continue;
		}

		try {
			let message = `[${i + 1}/${length} ${Math.floor(((i + 1) / length) * 100)}%] Load ${name} icon`;
			if (retry > 1) {
				message += `, attempt: "${retry}"`;
			}

			if (!spin.isSpinning) {
				spin.start(message);
			} else {
				spin.text = message;
			}

			const data = await getIconData(icon);
			const iconD = await svgRead(name, data.content, filled);

			info[name] = {
				sha,
				size,
				data: data.data,
				icon: iconD,
			};
			updated = true;
		} catch (err) {
			spin.stopAndPersist();

			if (err instanceof Error && err.code === "ECONNRESET") {
				if (retry > 15) {
					await fatal(name, "Connection failed");
				}
				i--;
				retry++;
				await new Promise((resolve) => setTimeout(resolve, 3000));
				continue;
			}

			if (!loaded.ignored[type].includes(name)) {
				updated = true;
				loaded.ignored[type].push(name);
			}

			console.log(`$ URL failure:`, icon.url);

			if (err instanceof Error && err.message.includes("API rate limit exceeded")) {
				await fatal(name, err.message);
			}

			console.log(`$ Parse ${name} icon failure:`, err);
		}

		retry = 1;
	}

	spin.succeed(`The ${type} icons loaded.`);
}

if (updated) {
	const iconsData = [];
	const categories = { all: [], "all-outline": [], "all-filled": [] };
	const names = { outline: [], filled: [] };

	for (const type of ["outline", "filled"]) {
		const info = loaded[type];
		const typeKey = "all-" + type;
		for (const name of Object.keys(info)) {
			if (!names[type].includes(name)) {
				names[type].push(name);
			}
			const icon = info[name];
			const line = [name, type === "filled" ? 2 : 1, icon.icon];
			const linePlain = [name, icon.icon];
			const category = icon.data.category ? String(icon.data.category).toLowerCase().replace(/ /g, "-") : null;

			categories.all.push(line);
			categories[typeKey].push(linePlain);

			if (category) {
				if (!categories[category]) {
					categories[category] = [];
				}
				categories[category].push(line);
				const plainKey = category + "-" + type;
				if (!categories[plainKey]) {
					categories[plainKey] = [];
				}
				categories[plainKey].push(linePlain);
			}

			iconsData.push({
				...icon.data,
				type,
				name,
			});
		}
	}

	const json = ["tags.json", "name-outline.json", "name-filled.json"];

	await writeJsonFile(cacheFile, loaded);

	await writeJsonFile(path.join(dataPath, "tags.json"), iconsData);
	await writeJsonFile(path.join(dataPath, `name-outline.json`), names.outline);
	await writeJsonFile(path.join(dataPath, `name-filled.json`), names.filled);

	for (const category in categories) {
		const file = `icon-${category}.json`;
		await writeJsonFile(path.join(dataPath, file), categories[category]);
		json.push(file);
	}

	// bundle.json
	await updateTypes(json);

	// package.json
	await updatePackageJson(json, loaded.version);

	// clear old data
	await clearOldData(json);
}
