"use client";

import * as React from "react";
import clsx from "clsx";
import { createSlot } from "@radix-ui/react-slot";
import { useSlideNavigatorClasses } from "./classes";

const Slot = createSlot("Slide.Base");

const Slide = React.forwardRef<
	HTMLDivElement,
	React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & { asChild?: boolean }
>(({ asChild, className, ...props }, ref) => {
	const classes = useSlideNavigatorClasses();
	const As = asChild ? Slot : "div";
	return <As {...props} data-type="slide" className={clsx(classes.slide, className)} ref={ref} />;
});

Slide.displayName = "Slide";

type SlideProps = React.ComponentProps<typeof Slide>;

export { Slide };
export type { SlideProps };
