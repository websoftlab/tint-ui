"use client";

import type { ElementRef, ComponentPropsWithoutRef } from "react";
import type { Scope } from "@radix-ui/react-context";

import * as React from "react";
import { composeEventHandlers } from "@radix-ui/primitive";
import { useComposedRefs } from "@radix-ui/react-compose-refs";
import { createContextScope } from "@radix-ui/react-context";
import { useId } from "@radix-ui/react-id";
import { useControllableState } from "@radix-ui/react-use-controllable-state";
import { DismissableLayer } from "@radix-ui/react-dismissable-layer";
import { FocusScope } from "@radix-ui/react-focus-scope";
import { Portal as PortalPrimitive } from "@radix-ui/react-portal";
import { Presence } from "@radix-ui/react-presence";
import { Primitive } from "@radix-ui/react-primitive";
import { useFocusGuards } from "@radix-ui/react-focus-guards";
import { hideOthers } from "aria-hidden";
import clsx from "clsx";
import { SvgThemeIcon } from "@tint-ui/svg-icon";
import { useProps } from "@tint-ui/theme";
import { useDialogClasses } from "./classes";

/* -------------------------------------------------------------------------------------------------
 * Dialog
 * -----------------------------------------------------------------------------------------------*/

const DIALOG_NAME = "Dialog";

type ScopedProps<P> = P & { __scopeDialog?: Scope };
const [createDialogContext] = createContextScope(DIALOG_NAME);

type DialogContextValue = {
	triggerRef: React.RefObject<HTMLButtonElement>;
	contentRef: React.RefObject<DialogContentElement>;
	contentId: string;
	titleId: string;
	descriptionId: string;
	open: boolean;
	onOpenChange(open: boolean): void;
	onOpenToggle(): void;
	modal: boolean;
};

const [DialogProvider, useDialogContext] = createDialogContext<DialogContextValue>(DIALOG_NAME);

interface DialogProps {
	children?: React.ReactNode;
	open?: boolean;
	defaultOpen?: boolean;
	modal?: boolean;

	onOpenChange?(open: boolean): void;
}

const Dialog: React.FC<DialogProps> = (props: ScopedProps<DialogProps>) => {
	const { __scopeDialog, children, open: openProp, defaultOpen = false, onOpenChange, modal = true } = props;
	const triggerRef = React.useRef<HTMLButtonElement>(null);
	const contentRef = React.useRef<DialogContentElement>(null);
	const [open = false, setOpen] = useControllableState({
		prop: openProp,
		defaultProp: defaultOpen,
		onChange: onOpenChange,
	});

	return (
		<DialogProvider
			scope={__scopeDialog}
			triggerRef={triggerRef}
			contentRef={contentRef}
			contentId={useId()}
			titleId={useId()}
			descriptionId={useId()}
			open={open}
			onOpenChange={setOpen}
			onOpenToggle={React.useCallback(() => setOpen((prevOpen) => !prevOpen), [setOpen])}
			modal={modal}
		>
			{children}
		</DialogProvider>
	);
};

Dialog.displayName = DIALOG_NAME;

/* -------------------------------------------------------------------------------------------------
 * DialogTrigger
 * -----------------------------------------------------------------------------------------------*/

const TRIGGER_NAME = "DialogTrigger";

type PrimitiveButtonProps = ComponentPropsWithoutRef<typeof Primitive.button>;

interface DialogTriggerProps extends PrimitiveButtonProps {}

const DialogTrigger = React.forwardRef<ElementRef<typeof Primitive.button>, DialogTriggerProps>(
	(props: ScopedProps<DialogTriggerProps>, forwardedRef) => {
		const { __scopeDialog, children, ...rest } = props;
		const triggerProps = useProps("component.dialog.trigger", rest, { as: Primitive.button });
		const context = useDialogContext(TRIGGER_NAME, __scopeDialog);
		const composedTriggerRef = useComposedRefs(forwardedRef, context.triggerRef);
		return (
			<Primitive.button
				type="button"
				aria-haspopup="dialog"
				aria-expanded={context.open}
				aria-controls={context.contentId}
				data-state={getState(context.open)}
				{...triggerProps}
				ref={composedTriggerRef}
				onClick={composeEventHandlers(props.onClick, context.onOpenToggle)}
			>
				{children}
			</Primitive.button>
		);
	}
);

DialogTrigger.displayName = TRIGGER_NAME;

/* -------------------------------------------------------------------------------------------------
 * DialogPortal
 * -----------------------------------------------------------------------------------------------*/

const PORTAL_NAME = "DialogPortal";

type PortalContextValue = { forceMount?: true };

const [PortalProvider, usePortalContext] = createDialogContext<PortalContextValue>(PORTAL_NAME, {
	forceMount: undefined,
});

type PortalProps = ComponentPropsWithoutRef<typeof PortalPrimitive>;

interface DialogPortalProps {
	children?: React.ReactNode;
	/**
	 * Specify a container element to portal the content into.
	 */
	container?: PortalProps["container"];
	/**
	 * Used to force mounting when more control is needed. Useful when
	 * controlling animation with React animation libraries.
	 */
	forceMount?: true;
}

const DialogPortal: React.FC<DialogPortalProps> = (props: ScopedProps<DialogPortalProps>) => {
	const { __scopeDialog, forceMount, children, container } = props;
	const context = useDialogContext(PORTAL_NAME, __scopeDialog);
	return (
		<PortalProvider scope={__scopeDialog} forceMount={forceMount}>
			{React.Children.map(children, (child) => (
				<Presence present={forceMount || context.open}>
					<PortalPrimitive asChild container={container}>
						{child}
					</PortalPrimitive>
				</Presence>
			))}
		</PortalProvider>
	);
};

DialogPortal.displayName = PORTAL_NAME;

/* -------------------------------------------------------------------------------------------------
 * DialogOverlay
 * -----------------------------------------------------------------------------------------------*/

const OVERLAY_NAME = "DialogOverlay";

interface DialogOverlayProps extends ComponentPropsWithoutRef<typeof Primitive.div> {
	/**
	 * Used to force mounting when more control is needed. Useful when
	 * controlling animation with React animation libraries.
	 */
	forceMount?: true;
}

const DialogOverlay = React.forwardRef<ElementRef<typeof Primitive.div>, DialogOverlayProps>(
	(props: ScopedProps<DialogOverlayProps>, forwardedRef) => {
		const portalContext = usePortalContext(OVERLAY_NAME, props.__scopeDialog);
		const { forceMount = portalContext.forceMount, children, ...rest } = props;
		const { className, ...overlayProps } = useProps("component.dialog.overlay", rest, { as: Primitive.div });
		const context = useDialogContext(OVERLAY_NAME, props.__scopeDialog);
		const classes = useDialogClasses();
		return (
			<Presence present={forceMount || context.open}>
				<Primitive.div
					data-state={getState(context.open)}
					{...overlayProps}
					className={clsx(classes.overlay, className)}
					ref={forwardedRef}
					// We re-enable pointer-events prevented by `Dialog.Content` to allow scrolling the overlay.
					style={{ pointerEvents: "auto", ...overlayProps.style }}
				>
					{children}
				</Primitive.div>
			</Presence>
		);
	}
);

DialogOverlay.displayName = OVERLAY_NAME;

/* -------------------------------------------------------------------------------------------------
 * DialogContent
 * -----------------------------------------------------------------------------------------------*/

const CONTENT_NAME = "DialogContent";

type DialogContentElement = ElementRef<typeof DismissableLayer>;

type FocusScopeProps = ComponentPropsWithoutRef<typeof FocusScope>;

interface DialogContentProps
	extends Omit<ComponentPropsWithoutRef<typeof DismissableLayer>, "onDismiss" | "disableOutsidePointerEvents"> {
	/**
	 * Event handler called when auto-focusing on open.
	 * Can be prevented.
	 */
	onOpenAutoFocus?: FocusScopeProps["onMountAutoFocus"];

	/**
	 * Event handler called when auto-focusing on close.
	 * Can be prevented.
	 */
	onCloseAutoFocus?: FocusScopeProps["onUnmountAutoFocus"];

	/**
	 * Used to force mounting when more control is needed. Useful when
	 * controlling animation with React animation libraries.
	 */
	forceMount?: true;
}

const DialogContent = React.forwardRef<DialogContentElement, DialogContentProps>(
	(props: ScopedProps<DialogContentProps>, forwardedRef) => {
		const portalContext = usePortalContext(CONTENT_NAME, props.__scopeDialog);
		const { __scopeDialog, children, ...rest } = props;
		const {
			forceMount = portalContext.forceMount,
			onOpenAutoFocus,
			onCloseAutoFocus,
			className,
			...contentProps
		} = useProps("component.dialog", rest, { as: DismissableLayer });
		const context = useDialogContext(CONTENT_NAME, __scopeDialog);
		const contentRef = React.useRef<HTMLDivElement>(null);
		const composedRefs = useComposedRefs(forwardedRef, context.contentRef, contentRef);
		const classes = useDialogClasses();

		// aria-hide everything except the content (better supported equivalent to setting aria-modal)
		React.useEffect(() => {
			const content = contentRef.current;
			if (content) return hideOthers(content);
		}, []);

		// Make sure the whole tree has focus guards as our `Dialog` will be
		// the last element in the DOM (because of the `Portal`)
		useFocusGuards();

		return (
			<Presence present={forceMount || context.open}>
				<FocusScope
					asChild
					loop
					// we make sure focus isn't trapped once `DialogContent` has been closed
					// (closed !== unmounted when animating out)
					trapped={context.open}
					onMountAutoFocus={onOpenAutoFocus}
					onUnmountAutoFocus={composeEventHandlers(onCloseAutoFocus, (event) => {
						event.preventDefault();
						context.triggerRef.current?.focus();
					})}
				>
					<DismissableLayer
						role="dialog"
						id={context.contentId}
						aria-describedby={context.descriptionId}
						aria-labelledby={context.titleId}
						data-state={getState(context.open)}
						className={clsx(classes.dialog, className)}
						{...contentProps}
						disableOutsidePointerEvents
						onPointerDownOutside={composeEventHandlers(props.onPointerDownOutside, (event) => {
							const originalEvent = event.detail.originalEvent;
							const isRightClick =
								originalEvent.button === 2 || (originalEvent.button === 0 && originalEvent.ctrlKey);

							// If the event is a right-click, we shouldn't close because
							// it is effectively as if we right-clicked the `Overlay`.
							if (isRightClick || document.documentElement.clientWidth - originalEvent.clientX < 20) {
								event.preventDefault();
							}
						})}
						// When focus is trapped, a `focusout` event may still happen.
						// We make sure we don't trigger our `onDismiss` in such case.
						onFocusOutside={composeEventHandlers(props.onFocusOutside, (event) => event.preventDefault())}
						ref={composedRefs}
						onDismiss={() => context.onOpenChange(false)}
					>
						{children}
					</DismissableLayer>
				</FocusScope>
			</Presence>
		);
	}
);

DialogContent.displayName = CONTENT_NAME;

/* -------------------------------------------------------------------------------------------------
 * DialogTitle
 * -----------------------------------------------------------------------------------------------*/

const TITLE_NAME = "DialogTitle";

interface DialogTitleProps extends ComponentPropsWithoutRef<typeof Primitive.h2> {}

const DialogTitle = React.forwardRef<ElementRef<typeof Primitive.h2>, DialogTitleProps>(
	(props: ScopedProps<DialogTitleProps>, forwardedRef) => {
		const { __scopeDialog, children, ...rest } = props;
		const { className, ...titleProps } = useProps("component.dialog.title", rest, { as: Primitive.h2 });
		const context = useDialogContext(TITLE_NAME, __scopeDialog);
		const classes = useDialogClasses();
		return (
			<Primitive.h2
				id={context.titleId}
				{...titleProps}
				className={clsx(classes.title, className)}
				ref={forwardedRef}
			>
				{children}
			</Primitive.h2>
		);
	}
);

DialogTitle.displayName = TITLE_NAME;

/* -------------------------------------------------------------------------------------------------
 * DialogDescription
 * -----------------------------------------------------------------------------------------------*/

const DESCRIPTION_NAME = "DialogDescription";

type DialogDescriptionElement = ElementRef<typeof Primitive.p>;
type PrimitiveParagraphProps = ComponentPropsWithoutRef<typeof Primitive.p>;

interface DialogDescriptionProps extends PrimitiveParagraphProps {}

const DialogDescription = React.forwardRef<DialogDescriptionElement, DialogDescriptionProps>(
	(props: ScopedProps<DialogDescriptionProps>, forwardedRef) => {
		const { __scopeDialog, children, ...rest } = props;
		const { className, ...descriptionProps } = useProps("component.dialog.description", rest, { as: Primitive.p });
		const context = useDialogContext(DESCRIPTION_NAME, __scopeDialog);
		const classes = useDialogClasses();
		return (
			<Primitive.p
				id={context.descriptionId}
				className={clsx(classes.description, className)}
				{...descriptionProps}
				ref={forwardedRef}
			>
				{children}
			</Primitive.p>
		);
	}
);

DialogDescription.displayName = DESCRIPTION_NAME;

/* -------------------------------------------------------------------------------------------------
 * DialogHeader
 * -----------------------------------------------------------------------------------------------*/

type PrimitiveDivProps = ComponentPropsWithoutRef<typeof Primitive.div>;

interface DialogHeaderProps extends PrimitiveDivProps {}

const DialogHeader = React.forwardRef<HTMLDivElement, DialogHeaderProps>(({ children, ...props }, ref) => {
	const { className, ...headerProps } = useProps("component.dialog.header", props, { as: Primitive.div });
	const classes = useDialogClasses();
	return (
		<Primitive.div {...headerProps} className={clsx(classes.header, className)} ref={ref}>
			{children}
		</Primitive.div>
	);
});

DialogHeader.displayName = "DialogHeader";

/* -------------------------------------------------------------------------------------------------
 * DialogFooter
 * -----------------------------------------------------------------------------------------------*/

interface DialogFooterProps extends PrimitiveDivProps {}

const DialogFooter = React.forwardRef<HTMLDivElement, DialogFooterProps>(({ children, ...props }, ref) => {
	const { className, ...footerProps } = useProps("component.dialog.footer", props, { as: Primitive.div });
	const classes = useDialogClasses();
	return (
		<Primitive.div {...footerProps} className={clsx(classes.footer, className)} ref={ref}>
			{children}
		</Primitive.div>
	);
});

DialogFooter.displayName = "DialogFooter";

/* -------------------------------------------------------------------------------------------------
 * DialogClose
 * -----------------------------------------------------------------------------------------------*/

const CLOSE_NAME = "DialogClose";

interface DialogCloseProps extends PrimitiveButtonProps {}

const DialogClose = React.forwardRef<ElementRef<typeof Primitive.button>, DialogCloseProps>(
	(props: ScopedProps<DialogCloseProps>, forwardedRef) => {
		const { __scopeDialog, children, onClick, ...rest } = props;
		const context = useDialogContext(CLOSE_NAME, __scopeDialog);
		const { className, ...closeProps } = useProps<DialogCloseProps>(
			"component.dialog.close",
			{
				type: "button",
				onClick: composeEventHandlers(onClick, () => context.onOpenChange(false)),
				"aria-label": "Close",
				...rest,
			},
			{ as: Primitive.button }
		);
		const classes = useDialogClasses();
		return (
			<Primitive.button {...closeProps} className={clsx(classes.close, className)} ref={forwardedRef}>
				<SvgThemeIcon icon="x" />
				{children}
			</Primitive.button>
		);
	}
);

DialogClose.displayName = CLOSE_NAME;

/* -----------------------------------------------------------------------------------------------*/

function getState(open: boolean) {
	return open ? "open" : "closed";
}

export {
	Dialog,
	DialogTrigger,
	DialogPortal,
	DialogOverlay,
	DialogContent,
	DialogTitle,
	DialogHeader,
	DialogFooter,
	DialogDescription,
	DialogClose,
};

export type {
	DialogProps,
	DialogTriggerProps,
	DialogPortalProps,
	DialogOverlayProps,
	DialogContentProps,
	DialogTitleProps,
	DialogHeaderProps,
	DialogFooterProps,
	DialogDescriptionProps,
	DialogCloseProps,
};
