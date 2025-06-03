import type { RegistryColors } from "../types";

const hsl = (value: string) => `hsl(${value})`;

export const createInlineColors = ({ light, dark }: RegistryColors) => {
	const result: RegistryColors = { light: {}, dark: {} };
	for (const key in light) {
		result.light[key] = hsl(light[key]);
	}
	for (const key in dark) {
		result.light[key] = hsl(dark[key]);
	}
	return result;
};

export const createCssVarsTemplate = ({ light, dark }: RegistryColors) => {
	let output = `@tailwind base;\n@tailwind components;\n@tailwind utilities;\n\n@layer base {\n\t:root {`;
	for (const key in light) {
		output += `\n\t\t--${key}: ${hsl(light[key])};`;
	}
	output += `\n\t}\n\n\t.dark {`;
	for (const key in dark) {
		output += `\n\t\t--${key}: ${hsl(dark[key])};`;
	}
	output += `\n\t}\n}\n\n@layer base {\n\t* {\n\t\t@apply border-border;\n\t}\n\tbody {\n\t\t@apply bg-background text-foreground;\n\t}\n}`;
	return output;
};
