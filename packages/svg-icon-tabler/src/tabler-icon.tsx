import type { DynamicIconHandler, SvgIconProps } from "@tint-ui/svg-icon";

import * as React from "react";
import { SvgIcon, SvgEmptyIcon } from "@tint-ui/svg-icon";
import { logger } from "@tint-ui/tools/logger";

interface CreateTablerIconHandlerOptions {
	names?: string[];
}

type IconDataType =
	| { type: "mixed"; data: [string, 1 | 2, string[]][] }
	| { type: "outline" | "filled"; data: [string, string[]][] };

type IconData = IconDataType | IconDataType[] | { default: IconDataType } | { default: IconDataType }[];

const baseProps = {
	outline: {
		stroke: "currentColor",
		strokeWidth: 2,
		strokeLinecap: "round",
		strokeLinejoin: "round",
	} as Pick<SvgIconProps, "stroke" | "strokeWidth" | "strokeLinecap" | "strokeLinejoin">,
	filled: {
		fill: "currentColor",
	} as Pick<SvgIconProps, "fill">,
};

const createIcon = (name: string, type: "filled" | "outline", data: string[]) => {
	const typeProps = baseProps[type];

	const IconData = React.memo(() => {
		return (
			<>
				{data.map((d, index) => (
					<path key={index} d={d} />
				))}
			</>
		);
	});

	const Icon = React.forwardRef<SVGSVGElement, SvgIconProps>(({ children, ...props }, ref) => {
		return (
			<SvgIcon {...typeProps} {...props} ref={ref}>
				{children}
				<IconData />
			</SvgIcon>
		);
	});

	IconData.displayName = `IconTablerData(${name})`;
	Icon.displayName = `TablerIcon(${name})`;

	return Icon;
};

const loadIcons = (
	icons: Map<string, { type: "outline" | "filled"; data: string[] }>,
	type: IconDataType,
	mixed: boolean
) => {
	if (type.type === "mixed") {
		type.data.forEach(([name, t, data]) => {
			if (t === 2) {
				icons.set(name + "-filled", { type: "filled", data });
			} else {
				icons.set(name, { type: "outline", data });
			}
		});
	} else {
		const iconType = type.type;
		if (iconType === "outline") {
			mixed = false;
		}
		type.data.forEach(([name, data]) => {
			if (mixed) {
				name += "-filled";
			}
			icons.set(name, { type: iconType, data });
		});
	}
};

const format = (data: IconData): { formatted: IconDataType[]; mixed: boolean } => {
	if (Array.isArray(data)) {
		const formatted: IconDataType[] = [];
		let mixed = false;
		data.forEach((type) => {
			const icon = "default" in type ? type.default : type;
			formatted.push(icon);
			if (!mixed && (icon.type === "mixed" || icon.type === "outline")) {
				mixed = true;
			}
		});
		return { formatted, mixed };
	} else {
		return { formatted: ["default" in data ? data.default : data], mixed: false };
	}
};

const createStaticTablerIconHandler = (data: IconData): DynamicIconHandler => {
	const icons = new Map<string, { type: "outline" | "filled"; data: string[] }>();
	const cache = new Map<string, React.ElementType>();

	const { formatted, mixed } = format(data);
	formatted.forEach((type) => {
		loadIcons(icons, type, mixed);
	});

	return (name: string) => {
		let icon = cache.get(name);
		if (icon) {
			return icon;
		}
		const iconData = icons.get(name);
		if (!iconData) {
			return null;
		}
		icon = createIcon(name, iconData.type, iconData.data);
		cache.set(name, icon);
		return icon;
	};
};

const createTablerIconHandler = (
	loader: () => Promise<IconData>,
	options: CreateTablerIconHandlerOptions = {}
): DynamicIconHandler => {
	let loaded = false;
	let loadStarted = false;
	let loadTryTimeout = 5;

	const required = Array.isArray(options.names);
	const icons = new Map<string, { type: "outline" | "filled"; data: string[] }>();
	const cache = new Map<string, React.ElementType>();
	const cacheLoader = new Map<string, React.ElementType>();
	const names = required ? options.names! : [];
	const loadListener = new Set<() => void>();

	const onLoadStart = () => {
		if (loadStarted) {
			return;
		}
		loadStarted = true;
		loader()
			.then((data) => {
				const { formatted, mixed } = format(data);
				formatted.forEach((type) => {
					loadIcons(icons, type, mixed);
				});
				loaded = true;
				const handlers = Array.from(loadListener.values());
				loadListener.clear();
				handlers.forEach((handler) => {
					handler();
				});
			})
			.catch((err) => {
				logger.error("Fatal tabler load:", err);
				setTimeout(() => {
					loadStarted = false;
				}, loadTryTimeout * 1000);
				loadTryTimeout += 10;
			});
	};

	const getIcon = (name: string) => {
		let icon = cache.get(name);
		if (icon) {
			return icon;
		}
		const iconData = icons.get(name);
		if (!iconData) {
			return SvgEmptyIcon;
		}
		icon = createIcon(name, iconData.type, iconData.data);
		cache.set(name, icon);
		return icon;
	};

	const createIconLoader = (name: string) => {
		const IconLoader = React.forwardRef<SVGSVGElement, SvgIconProps>((props, ref) => {
			const [Icon, setIcon] = React.useState<React.ElementType | null>(() => (loaded ? getIcon(name) : null));
			React.useEffect(() => {
				const onLoad = () => {
					setIcon(getIcon(name));
				};
				loadListener.add(onLoad);
				onLoadStart();
				return () => {
					loadListener.delete(onLoad);
				};
			}, [name]);

			// already loaded
			if (Icon != null) {
				return <Icon {...props} ref={ref} />;
			}

			// create spinner
			const { spin, ...rest } = props;
			return (
				<SvgIcon spin {...rest} ref={ref}>
					<path d="" />
				</SvgIcon>
			);
		});
		IconLoader.displayName = `TablerIconLoader(${name})`;
		return IconLoader;
	};

	return (name) => {
		if (loaded) {
			return getIcon(name);
		}
		if (required && !names.includes(name)) {
			return null;
		}
		let loader = cacheLoader.get(name);
		if (!loader) {
			loader = createIconLoader(name);
			cacheLoader.set(name, loader);
		}
		return loader;
	};
};

export { createStaticTablerIconHandler, createTablerIconHandler };
export type { CreateTablerIconHandlerOptions };
