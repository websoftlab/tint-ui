export const FRAMEWORKS: Record<FrameworkName, Framework> = {
	"next-app": {
		name: "next-app",
		label: "Next.js",
		links: {
			tailwind: "https://tailwindcss.com/docs/guides/nextjs",
		},
	},
	"next-pages": {
		name: "next-pages",
		label: "Next.js",
		links: {
			tailwind: "https://tailwindcss.com/docs/guides/nextjs",
		},
	},
	remix: {
		name: "remix",
		label: "Remix",
		links: {
			tailwind: "https://tailwindcss.com/docs/guides/remix",
		},
	},
	vite: {
		name: "vite",
		label: "Vite",
		links: {
			tailwind: "https://tailwindcss.com/docs/guides/vite",
		},
	},
	astro: {
		name: "astro",
		label: "Astro",
		links: {
			tailwind: "https://tailwindcss.com/docs/guides/astro",
		},
	},
	laravel: {
		name: "laravel",
		label: "Laravel",
		links: {
			tailwind: "https://tailwindcss.com/docs/guides/laravel",
		},
	},
	gatsby: {
		name: "gatsby",
		label: "Gatsby",
		links: {
			tailwind: "https://tailwindcss.com/docs/guides/gatsby",
		},
	},
	phragon: {
		name: "phragon",
		label: "Phragon",
		links: {
			tailwind: "https://tailwindcss.com/docs/installation",
		},
	},
	manual: {
		name: "manual",
		label: "Manual",
		links: {
			tailwind: "https://tailwindcss.com/docs/installation",
		},
	},
} as const;

export type FrameworkName =
	| "next-app"
	| "next-pages"
	| "remix"
	| "vite"
	| "astro"
	| "laravel"
	| "gatsby"
	| "phragon"
	| "manual";

export interface Framework {
	name: FrameworkName;
	label: string;
	links: {
		tailwind: string;
		installation?: string;
	};
}
