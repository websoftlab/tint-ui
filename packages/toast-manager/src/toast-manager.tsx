"use client";

import type { ComponentProps } from "react";
import type { TriggerToastCloseProps, TriggerToastProps } from "./types";

import * as React from "react";
import { Toaster, toast } from "sonner";
import clsx from "clsx";
import { useGlobalName } from "@tint-ui/tools/use-global-name";
import { useThemeMode } from "@tint-ui/theme";
import { useTrigger } from "@tint-ui/trigger";
import { SvgThemeIcon } from "@tint-ui/svg-icon";
import { toastTrigger } from "./toast-trigger";
import { useToastClasses } from "./classes";

type BaseToastProps = ComponentProps<typeof Toaster>;

type ToastManagerProps = Omit<BaseToastProps, "toastOptions" | "icons"> & {
	toastOptions?: Omit<BaseToastProps["toastOptions"], "classNames">;
	globalName?: string | boolean | null;
};

const createIcon = (name: string, classes: { icon: string; spin: string; close: string }) => {
	return (
		<SvgThemeIcon
			icon={name}
			className={clsx(classes.icon, name === "loader" && classes.spin, name === "x" && classes.close)}
		/>
	);
};

const ToastManager = ({ className, globalName, toastOptions, ...props }: ToastManagerProps) => {
	const service = useTrigger();
	const theme = useThemeMode();
	const { svgIcon, svgIconSpin, svgIconClose, toaster, ...classNames } = useToastClasses();

	const icons = React.useMemo(() => {
		const iconClasses = { icon: svgIcon, spin: svgIconSpin, close: svgIconClose };
		return {
			loading: createIcon("loader", iconClasses),
			close: createIcon("x", iconClasses),
			success: createIcon("toast-success", iconClasses),
			info: createIcon("toast-info", iconClasses),
			warning: createIcon("toast-warning", iconClasses),
			error: createIcon("toast-error", iconClasses),
		};
	}, [svgIcon, svgIconSpin, svgIconClose]);

	React.useEffect(
		() =>
			service.registerMany(
				{
					toast: (props: TriggerToastProps) => toastTrigger(service, props),
					"toast.close": ({ id }: TriggerToastCloseProps) => {
						toast.dismiss(id);
					},
				},
				{
					toast: {
						detail: { toast },
					},
				}
			),
		[service]
	);

	useGlobalName(toast, globalName, "__uiToast");

	return (
		<Toaster
			theme={theme}
			position="bottom-center"
			className={clsx(toaster, className)}
			richColors
			expand
			{...props}
			icons={icons}
			toastOptions={{
				...toastOptions,
				classNames: classNames,
			}}
		/>
	);
};

export { ToastManager };
export type { ToastManagerProps };
