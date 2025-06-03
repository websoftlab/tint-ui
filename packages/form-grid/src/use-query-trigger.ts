"use client";

import type { FieldValues } from "react-hook-form";
import type { TriggerToastProps } from "@tint-ui/toast-manager";
import type { FormGridTriggerProps } from "./types";

import * as React from "react";
import { errorMessage } from "@tint-ui/tools/error-message";
import { useTrigger } from "@tint-ui/trigger";

const useQueryTrigger = (triggerName: string, options: { toastError?: boolean; toastId?: string } = {}) => {
	const trigger = useTrigger();
	const [loading, setLoading] = React.useState(false);
	const [error, setError] = React.useState<string | null>(null);
	const [complete, setComplete] = React.useState<boolean>(false);

	const props = {
		name: triggerName,
		...options,
	};
	const ref = React.useRef(props);
	ref.current = props;

	const { send, onReset, onMount } = React.useMemo(() => {
		let mount = false;
		let loading = false;
		let isComplete: boolean = false;
		return {
			send(
				url: string,
				options: {
					method?: FormGridTriggerProps["method"];
					body: FieldValues;
					error: (err: unknown) => void;
					done: (values?: FieldValues) => void;
				}
			) {
				if (!mount || loading || isComplete) {
					return;
				}
				const { name, toastError = true, toastId = "form-error" } = ref.current;
				const { method = "post", body, done, error: errorHandler } = options;
				setLoading((loading = true));
				setError(null);
				const onError = (err: unknown) => {
					if (!mount) {
						return;
					}
					setLoading((loading = false));
					const error = errorMessage(err);
					if (err == null) {
						err = error;
					}
					if (toastError && trigger.registered("toast")) {
						trigger.emit<TriggerToastProps>("toast", {
							id: toastId,
							level: "error",
							...error,
						});
					} else {
						setError(error.message);
					}
					errorHandler(err);
				};
				trigger.emit<FormGridTriggerProps>(
					name,
					{
						url,
						method,
						body,
						onSuccess(values) {
							if (!mount) {
								return;
							}
							setLoading((loading = false));
							setComplete((isComplete = true));
							done(values);
						},
						onError,
					},
					(err) => {
						if (loading && err) {
							onError(err);
						}
					}
				);
			},
			onReset() {
				if (!loading && mount) {
					setError(null);
					setComplete((isComplete = false));
				}
			},
			onMount() {
				mount = true;
				if (loading) setLoading(false);
				if (error != null) setError(null);
				if (complete) setComplete(false);
				return () => {
					mount = false;
					loading = false;
					isComplete = false;
				};
			},
		};
	}, [trigger]);

	React.useEffect(onMount, [onMount]);

	return {
		loading,
		error,
		complete,
		send,
		onReset,
	};
};

export { useQueryTrigger };
