import type { TriggerServiceImpl } from "@tint-ui/trigger";
import type { TriggerDialogConfirm, TriggerDialogAlert, TriggerDialogPrompt } from "./types";

/**
 * createDialogConfirm is a function that returns an async function.
 * The returned function shows a confirmation dialog and returns a Promise that resolves to true when confirmed and false when cancelled.
 *
 * Can be used with React.useMemo, for example:
 * ```ts
 * const confirmation = React.useMemo(() => createDialogConfirm(trigger), [trigger]);
 * ```
 *
 * Or directly for calling:
 * ```ts
 * const confirmHandler = React.useMemo(() => {
 *   const handler = createDialogConfirm(trigger);
 *   return async () => {
 *     const confirmed = await handler(message);
 *     if (confirmed) {
 *       // some action
 *     }
 *   };
 * }, [trigger, message]);
 * ```
 *
 * @param {TriggerServiceImpl} trigger - The trigger service implementation.
 * @returns {(message: string, id?: string) => Promise<boolean>} - A function that creates a dialog confirm.
 */
const createDialogConfirm = (trigger: TriggerServiceImpl): ((message: string, id?: string) => Promise<boolean>) => {
	return (message: string, id?: string): Promise<boolean> => {
		return new Promise<boolean>((resolve, reject) => {
			trigger.emit<TriggerDialogConfirm & { id?: string }>(
				"dialog:confirm",
				{
					id,
					message,
					confirmHandler() {
						resolve(true);
					},
					cancelHandler() {
						resolve(false);
					},
				},
				(err) => {
					if (err) {
						reject(err);
					}
				}
			);
		});
	};
};

/**
 * createDialogAlert is a function that returns an async function.
 * The returned function shows an alert dialog and returns a Promise that resolves when the dialog is closed.
 *
 * @param {TriggerServiceImpl} trigger - The trigger service implementation.
 * @returns {(message: string, id?: string) => Promise<void>} - A function that creates a dialog alert.
 */
const createDialogAlert = (trigger: TriggerServiceImpl): ((message: string, id?: string) => Promise<void>) => {
	return (message: string, id?: string): Promise<void> => {
		return new Promise<void>((resolve, reject) => {
			trigger.emit<TriggerDialogAlert & { id?: string }>(
				"dialog:alert",
				{
					id,
					message,
					cancelHandler() {
						resolve();
					},
				},
				(err) => {
					if (err) {
						reject(err);
					}
				}
			);
		});
	};
};

/**
 * createDialogPrompt is a function that returns an async function.
 * The returned function shows a prompt dialog and returns a Promise that resolves to the input value when confirmed and null when cancelled.
 *
 * @param {TriggerServiceImpl} trigger - The trigger service implementation.
 * @returns {(message: string, id?: string) => Promise<string | null>} - A function that creates a dialog prompt.
 */
const createDialogPrompt = (
	trigger: TriggerServiceImpl
): ((message: string, id?: string) => Promise<string | null>) => {
	return (message: string, id?: string): Promise<string | null> => {
		return new Promise<string | null>((resolve, reject) => {
			trigger.emit<TriggerDialogPrompt & { id?: string }>(
				"dialog:prompt",
				{
					id,
					message,
					confirmHandler: resolve,
					cancelHandler() {
						resolve(null);
					},
				},
				(err) => {
					if (err) {
						reject(err);
					}
				}
			);
		});
	};
};

export { createDialogConfirm, createDialogAlert, createDialogPrompt };
