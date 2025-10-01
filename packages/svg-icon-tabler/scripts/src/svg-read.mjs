import XmlReader from "xml-reader";

async function read(text) {
	const reader = XmlReader.create();
	return new Promise((resolve, reject) => {
		reader.on("done", (data) => {
			resolve(data);
		});
		reader.on("error", (error) => {
			reject(error);
		});
		reader.parse(text);
	});
}

function d2(val) {
	let text = String(Math.floor(val * 100) / 100);
	if (text.startsWith("0.") && text.length > 2) {
		text = text.substring(1);
	}
	return text;
}

function circleToPath(attr) {
	let { cx, cy, r, ...rest } = attr;
	cx = parseFloat("0" + cx);
	cy = parseFloat("0" + cy);
	r = parseFloat("0" + r);
	const r2 = r * 2;
	return {
		...rest,
		d:
			"M" +
			d2(cx - r) +
			"," +
			d2(cy) +
			"a" +
			d2(r) +
			"," +
			d2(r) +
			" 0 1,0 " +
			d2(r2) +
			",0a" +
			d2(r) +
			"," +
			d2(r) +
			" 0 1,0 " +
			-d2(r2) +
			",0",
	};
}

export const svgRead = async (name, text, filled) => {
	const info = await read(text);
	const icon = [];
	if (!Array.isArray(info.children)) {
		throw new Error(`Not found children element for "${name}" icon`);
	}

	for (const child of info.children) {
		if (child.name === "path" && child.attributes?.d === "M0 0h24v24H0z") {
			continue;
		}
		if (Array.isArray(child.children) && child.children.length > 0) {
			throw new Error(`Child in: ${name} - ${child.name}`);
		}

		let attr = child.attributes || {};
		if (child.name === "circle") {
			attr = circleToPath(attr);
			if (!filled && attr.fill === "currentColor") {
				delete attr["fill"];
			}
		} else if (child.name !== "path") {
			throw new Error(`Invalid node name: "${child.name}" for the "${name}" icon`);
		}

		if (filled) {
			if (attr["stroke-width"] === "0" && attr.fill === "currentColor") {
				delete attr["stroke-width"];
				delete attr["fill"];
			}
		}

		if (Object.keys(attr).length !== 1) {
			throw new Error(`Invalid stroke attributes for the "${name}" icon`);
		}

		if (!attr.d) {
			throw new Error(`Invalid stroke attributes for the "${name}" icon, d - is empty`);
		}

		icon.push(attr.d);
	}

	return icon;
};
