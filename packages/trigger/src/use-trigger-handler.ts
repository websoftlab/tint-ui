import type { MouseEvent, MouseEventHandler } from "react";
import type { TriggerToastProps } from "@tint-ui/toast-manager";
import type { TriggerDialogConfirm } from "@tint-ui/dialog-manager";
import type { TriggerProp, TriggerServiceImpl } from "./types";

import * as React from "react";
import { logger } from "@tint-ui/tools/logger";
import { errorMessage } from "@tint-ui/tools/error-message";
import { useTrigger } from "./context";

/**
 * Props for the useTriggerHandler hook
 *
 * @interface UseTriggerHandlerProps
 * @property {TriggerProp} [trigger] - Trigger configuration for the handler
 * @property {string} [confirmation] - Confirmation message to show before triggering. If provided, will show a confirmation dialog before executing the trigger
 * @property {boolean} [loading] - Whether the handler is in loading state
 * @property {boolean} [disabled] - Whether the handler is disabled
 */
interface UseTriggerHandlerProps {
	/**
	 * Trigger configuration for the handler
	 */
	trigger?: TriggerProp;
	/**
	 * Confirmation message to show before triggering
	 * If provided, will show a confirmation dialog before executing the trigger
	 */
	confirmation?: string;
	/**
	 * Whether the handler is in loading state
	 * @default false
	 */
	loading?: boolean;
	/**
	 * Whether the handler is disabled
	 * @default false
	 */
	disabled?: boolean;
}

/**
 * Props for the useTriggerEventHandler hook
 * @template E - The type of the HTML element that the handler will be attached to
 */
interface UseTriggerEventHandlerProps<E extends Element> extends UseTriggerHandlerProps {
	/**
	 * Optional click handler that will be called before the trigger
	 * Can be async function
	 */
	onClick?: MouseEventHandler<E>;
	/**
	 * Whether to prevent default event behavior and abort trigger execution if onClick handler called event.preventDefault()
	 * @default true
	 */
	defaultPrevented?: boolean;
}

/**
 * Return type for the useTriggerEventHandler hook
 * @template E - The type of the HTML element that the handler will be attached to
 */
interface UseTriggerEventHandlerReturn<E extends Element> {
	/**
	 * Click handler for the trigger
	 */
	clickHandler: MouseEventHandler<E>;
	/**
	 * Loading state of the trigger
	 */
	loading: boolean;
}

/**
 * Return type for the useTriggerEventHandler hook
 * @template E - The type of the HTML element that the handler will be attached to
 */
interface UseTriggerHandlerReturn {
	/**
	 * Click handler for the trigger
	 */
	clickHandler: () => void;
	/**
	 * Loading state of the trigger
	 */
	loading: boolean;
}

const isConfirmation = (confirmation: string | null | undefined): confirmation is string => {
	if (typeof confirmation === "string") {
		return confirmation.trim().length > 0;
	}
	return false;
};

const prepare = (service: TriggerServiceImpl, triggerId: string, setLoading: (value: boolean) => void) => {
	let mount = false;
	let loading = false;

	const isLoading = (value: boolean) => {
		if (mount && loading !== value) {
			loading = value;
			setLoading(loading);
		}
	};

	return {
		isLoading,
		onMount() {
			mount = true;
			return () => {
				mount = false;
			};
		},
		async confirm(message: string) {
			isLoading(true);
			let error: unknown = null;
			if (service.registered("dialog:confirm")) {
				try {
					return await new Promise<boolean>((resolve) => {
						service.emit<TriggerDialogConfirm & { id: string }>("dialog:confirm", {
							message,
							id: triggerId,
							confirmHandler() {
								resolve(true);
							},
							cancelHandler() {
								resolve(false);
							},
						});
					});
				} catch (err) {
					error = err;
				}
			} else {
				try {
					return await new Promise((resolve) => {
						window.setTimeout(() => {
							resolve(window.confirm(message));
						});
					});
				} catch (err) {
					error = err;
				}
			}
			logger.error("Confirmation failure", error);
			return false;
		},
		trigger(trigger: TriggerProp | null | undefined) {
			if (!trigger) {
				return;
			}
			isLoading(true);
			service.emitProp(trigger, (err?: unknown) => {
				isLoading(false);
				if (err != null) {
					logger.error(`Trigger failure`, err);
					if (service.registered("toast")) {
						service.emit<TriggerToastProps>("toast", {
							id: triggerId,
							level: "error",
							message: errorMessage(err).message,
						});
					}
				}
			});
		},
		get mount() {
			return mount;
		},
		get loading() {
			return loading;
		},
	};
};

/**
 * Hook for handling trigger events with loading state and confirmation support
 *
 * @function useTriggerHandler
 * @param {UseTriggerHandlerProps} props - Configuration options for the trigger handler
 * @returns {UseTriggerHandlerReturn} Object containing the click handler and loading state
 *
 * @example
 * ```tsx
 * const MyComponent = () => {
 *   const { clickHandler, loading } = useTriggerHandler({
 *     trigger: {
 *       name: "myTrigger",
 *       props: { data: "example" }
 *     },
 *     confirmation: "Are you sure?"
 *   });
 *
 *   return (
 *     <button onClick={clickHandler} disabled={loading}>
 *       Trigger Event
 *     </button>
 *   );
 * };
 * ```
 *
 * @remarks
 * The hook provides the following features:
 * - Loading state management
 * - Confirmation dialog support
 * - Error handling with toast notifications
 * - Async operation support
 */
const useTriggerHandler = function (props: UseTriggerHandlerProps): UseTriggerHandlerReturn {
	const service = useTrigger();
	const [, setLoading] = React.useState(false);
	const triggerId = React.useId();
	const ref = React.useRef(props);
	const { onMount, ...rest } = React.useMemo(() => {
		const evn = prepare(service, triggerId, setLoading);
		return {
			onMount: evn.onMount,
			get loading() {
				return ref.current.loading === true || evn.loading;
			},
			clickHandler: () => {
				const { trigger, disabled, confirmation } = ref.current;
				if (evn.loading || disabled || !evn.mount) {
					return;
				}
				if (isConfirmation(confirmation)) {
					evn.confirm(confirmation)
						.then((test) => {
							test && evn.trigger(trigger);
						})
						.finally(() => {
							evn.isLoading(false);
						});
				} else {
					evn.trigger(trigger);
				}
			},
		};
	}, [service, triggerId]);

	React.useEffect(onMount, [onMount]);
	React.useEffect(() => {
		ref.current = props;
	}, [props]);

	return rest;
};

/**
 * Hook for handling click events on HTML elements with optional onClick handler that can cancel trigger execution
 *
 * @template E - The type of the HTML element that the handler will be attached to
 * @param {UseTriggerEventHandlerProps<E>} props - Configuration options for the trigger handler
 * @returns Object containing the click handler and loading state
 *
 * @example
 * ```tsx
 * const MyComponent = () => {
 *   const { clickHandler, loading } = useTriggerEventHandler({
 *     trigger: {
 *       name: "myTrigger",
 *       props: { data: "example" }
 *     },
 *     confirmation: "Are you sure?"
 *   });
 *
 *   return (
 *     <button onClick={clickHandler} disabled={loading}>
 *       Trigger Event
 *     </button>
 *   );
 * };
 * ```
 *
 * @remarks
 * The hook provides the following features:
 * - Loading state management
 * - Confirmation dialog support
 * - Error handling with toast notifications
 * - Async operation support
 * - Default event prevention
 */
const useTriggerEventHandler = function <E extends Element>(
	props: UseTriggerEventHandlerProps<E>
): UseTriggerEventHandlerReturn<E> {
	const service = useTrigger();
	const [, setLoading] = React.useState(false);
	const triggerId = React.useId();
	const ref = React.useRef(props);
	const { onMount, ...rest } = React.useMemo(() => {
		const evn = prepare(service, triggerId, setLoading);
		return {
			onMount: evn.onMount,
			get loading() {
				return ref.current.loading === true || evn.loading;
			},
			clickHandler: async (event: MouseEvent<E>) => {
				const { onClick, trigger, disabled, confirmation, defaultPrevented = true } = ref.current;
				if (evn.loading || disabled || !evn.mount) {
					return;
				}
				if (isConfirmation(confirmation)) {
					const test = await evn.confirm(confirmation);
					if (!test) {
						event.preventDefault();
						evn.isLoading(false);
						return;
					}
				}
				if (typeof onClick === "function") {
					const click = onClick(event);
					if (typeof click === "object" && "then" in click && "catch" in click) {
						await (click as Promise<void>);
					}
					if (defaultPrevented && event.isDefaultPrevented()) {
						return;
					}
				}
				event.preventDefault();
				evn.trigger(trigger);
			},
		};
	}, [service, triggerId]);

	React.useEffect(onMount, [onMount]);
	React.useEffect(() => {
		ref.current = props;
	}, [props]);

	return rest;
};

export { useTriggerHandler, useTriggerEventHandler };
export type {
	UseTriggerHandlerProps,
	UseTriggerHandlerReturn,
	UseTriggerEventHandlerProps,
	UseTriggerEventHandlerReturn,
};
