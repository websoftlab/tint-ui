const merge = (a: string[], b: string[]) => {
	for (let line of b) {
		line = line.trim();
		if (line.length && !a.includes(line)) {
			a.push(line);
		}
	}
	return a;
};

export function mergeArrayString(a: string[], b?: string | string[]) {
	a = merge([], a);
	if (typeof b === "string") {
		return merge(a, [b]);
	}
	if (Array.isArray(b)) {
		return merge(a, b);
	}
	return a;
}
