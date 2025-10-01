"use client";

import type { ButtonSize } from "@tint-ui/button";
import type { SlideNavigatorOptions, SlideNavigatorApi } from "./types";

import * as React from "react";
import { useProps } from "@tint-ui/theme";
import { useSlideNavigatorFilterClasses } from "./classes";
import { useSlideNavigator } from "./use-slide-navigator";
import { NavButton } from "./nav-button";

type Props = {
	arrow?: "auto" | boolean;
	apiRef?: React.Ref<SlideNavigatorApi>;
	themePropsType?: string;
	size?: ButtonSize | "auto";
};

type SlideNavigatorPropsNoRef = Omit<
	React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>,
	keyof Props
> &
	SlideNavigatorOptions &
	Props;

const SlideNavigator = React.forwardRef<HTMLDivElement, SlideNavigatorPropsNoRef>((inputProps, ref) => {
	const { themePropsType } = inputProps;
	const {
		apiRef,
		children,
		arrow = "auto",
		align = "start",
		startIndex,
		dragConfig,
		...props
	} = useProps("component.slide-navigator", inputProps, { as: "div" });

	const [containerRef, api] = useSlideNavigator({
		apiRef,
		children,
		startIndex,
		align,
		dragConfig,
	});

	const { prevDisabled, nextDisabled, prevHandler, nextHandler } = React.useMemo(
		() => ({
			get prevDisabled() {
				return api ? !api.canBePrev : true;
			},
			get nextDisabled() {
				return api ? !api.canBeNext : true;
			},
			prevHandler: () => {
				if (api) {
					api.goPrev();
				}
			},
			nextHandler: () => {
				if (api) {
					api.goNext();
				}
			},
		}),
		[api]
	);

	const navigation = arrow === "auto" ? (api ? api.canBeDrag : false) : arrow;
	const { filterProps, classes } = useSlideNavigatorFilterClasses();
	const filter = filterProps({ ...props, navigation });
	const size = filter.filters.size;
	const buttonSize = size === "auto" || size == null ? undefined : size;

	return (
		<div {...filter.props} className={filter.className} data-type="slider" ref={ref}>
			{navigation && (
				<NavButton
					themePropsType={themePropsType}
					size={buttonSize}
					mode="previous"
					disabled={prevDisabled}
					onClick={prevHandler}
				/>
			)}
			<div className={classes.viewport} data-type="slider-viewport">
				<div
					className={classes.container}
					ref={containerRef as React.MutableRefObject<HTMLDivElement>}
					data-type="slider-container"
				>
					{children}
				</div>
			</div>
			{navigation && (
				<NavButton
					themePropsType={themePropsType}
					size={buttonSize}
					mode="next"
					disabled={nextDisabled}
					onClick={nextHandler}
				/>
			)}
		</div>
	);
});

SlideNavigator.displayName = "SlideNavigator";

type SlideNavigatorProps = React.ComponentProps<typeof SlideNavigator>;

export { SlideNavigator };
export type { SlideNavigatorProps };
