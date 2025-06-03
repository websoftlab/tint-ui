import { useApp } from "@tint-ui/app";

export const useDialogText = <T extends { title: string }, K extends keyof T>(
	keys: K[],
	props: Partial<T>,
	alternative: T
) => {
	const app = useApp();
	const result = {} as Record<K, string>;

	for (const id of keys) {
		if (props[id]) {
			result[id] = props[id] as string;
		} else if (id === "title") {
			result[id] = app.translate(
				`dialog.title${alternative.title}`,
				typeof location === "undefined" ? alternative.title : location.host
			);
		} else {
			result[id] = app.translate(`dialog.${id as string}`, alternative[id] as string);
		}
	}

	return result;
};
