const noName = Symbol.for("#input.field");

const createKeyControl = () => {
	const map: Record<string | symbol, number> = {
		[noName]: 0,
	};
	return (name: string | symbol) => {
		if (!name) {
			name = noName;
		}
		if (map.hasOwnProperty(name)) {
			return String(name) + ":" + map[name]++;
		}
		map[name] = 1;
		return String(name);
	};
};

export { createKeyControl };
