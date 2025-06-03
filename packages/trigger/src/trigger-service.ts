import type { TriggerAbortedProps, TriggerServiceImpl, TriggerConfig, TriggerProp } from "./types";

import { logger } from "@tint-ui/tools/logger";
import { createTriggerProp } from "./create-trigger-prop";

type Queue = {
	emitter: () => Promise<void>;
	complete?: (err?: unknown) => void;
};

type Config<D = any> = {
	limit: number;
	isTriggerExecuting: boolean;
	abortControllerSupport: boolean;
	abortHandler: null | (() => void);
	detail: D;
};

type Listener<P = any> = (props: P) => P;

const MAX_QUEUE_LENGTH = 100;

const getProps = <P>(props: P, set?: Set<Listener<P>>) => {
	if (!set) {
		return props;
	}
	set.forEach((cb) => {
		props = cb(props);
	});
	return props;
};

const registrator = (service: TriggerService, name: string) => {
	const { _configs, _listeners } = service;
	const config = _configs.get(name);
	if (config) {
		config.detail = getProps({ name, detail: config.detail }, _listeners.get(`@:register`)).detail;
	} else {
		getProps({ name }, _listeners.get(`@:unregister`));
	}
};

const emitError = (message: string, complete?: ((err?: unknown) => void) | undefined) => {
	const error = new Error(message);
	if (typeof complete === "function") {
		complete(error);
	} else {
		logger.error(`Emit failure`, error);
	}
};

const emitNext = <P>(
	service: TriggerService,
	name: string,
	props?: P | (P & TriggerAbortedProps) | undefined,
	complete?: ((err?: unknown) => void) | undefined
) => {
	const { _triggers, _queue, _configs, _listeners } = service;

	const trigger = _triggers.get(name);
	if (!trigger) {
		return emitError(`Trigger "${name}" was not registered.`, complete);
	}

	const queue = _queue.get(name)!;
	const config = _configs.get(name)!;
	const length = queue.length + (config.isTriggerExecuting ? 1 : 0);

	if (length >= config.limit) {
		return emitError(`Queue for trigger "${name}" exceeded the maximum length of ${config.limit}.`, complete);
	}

	if (!props) {
		props = {} as P;
	}

	let aborted: unknown = null;
	let ended = false;

	// Extract abortHandler and handle the abort logic
	let { abortHandler, abortTimeout, ...rest } = props as P & TriggerAbortedProps;
	if (typeof abortHandler !== "function" && config.abortControllerSupport) {
		const abortController = new AbortController();
		(rest as { signal?: AbortSignal }).signal = abortController.signal;
		abortHandler = () => {
			if (!ended) {
				abortController.abort();
			}
		};
	}

	const abortHandlerCallback = (err?: unknown) => {
		if (aborted) {
			return;
		}
		aborted = err || new TriggerAbortError(name);

		const callbackList = [
			() => {
				if (typeof abortHandler === "function") {
					abortHandler();
				}
			},
			complete,
			...queue.map((item) => item.complete),
		];

		// Reset queue
		queue.length = 0;

		// Reset config
		config.isTriggerExecuting = false;
		config.abortHandler = null;

		// Call complete callbacks in background
		for (const cb of callbackList) {
			if (typeof cb !== "function") {
				continue;
			}
			try {
				cb(aborted);
			} catch (error) {
				logger.error(`Error in abortHandler callback for trigger "${name}":`, error);
			}
		}
	};

	// Define the emitter function that will trigger the action
	const emitter = async () => {
		if (ended) {
			return;
		}

		let timeout = abortTimeout ? setTimeout(abortHandlerCallback, abortTimeout) : null;

		config.abortHandler = abortHandlerCallback;
		try {
			await trigger(getProps(rest, _listeners.get(name)));
			ended = true;
			if (typeof complete === "function") {
				complete();
			}
		} catch (err) {
			if (aborted) {
				return;
			}
			if (!ended && typeof complete === "function") {
				complete(err);
			} else {
				throw err;
			}
		} finally {
			ended = true;
			if (timeout) {
				clearTimeout(timeout);
			}
		}
	};

	// Add the emitter to the queue and trigger global emission if needed
	queue.push({ complete, emitter });
	if (!config.isTriggerExecuting) {
		config.isTriggerExecuting = true;
		globalEmit(queue)
			.catch((err) => {
				abortHandlerCallback(err);
			})
			.finally(() => {
				config.isTriggerExecuting = false;
				config.abortHandler = null;
			});
	}
};

const globalEmit = async (queue: Queue[]) => {
	while (queue.length !== 0) {
		await queue.shift()!.emitter();
	}
};

/**
 * Error class representing an aborted trigger.
 * @extends {Error}
 */
class TriggerAbortError extends Error {
	constructor(public triggerName: string) {
		super("Trigger request aborted");
	}
}

/**
 * Service for registering and managing triggers.
 * @implements {TriggerServiceImpl}
 */
class TriggerService implements TriggerServiceImpl {
	_triggers: Map<string, (p: any) => void | Promise<void>> = new Map();
	_configs: Map<string, Config> = new Map();
	_queue: Map<string, Queue[]> = new Map();
	_listeners: Map<string, Set<Listener>> = new Map();

	/**
	 * Registers a new trigger.
	 *
	 * @template P - The type of the properties passed to the trigger.
	 * @template D - Public details associated with a registered trigger.
	 * @param {string} name - The name of the trigger.
	 * @param {(p: P) => void | Promise<void>} cb - The callback to execute for the trigger.
	 * @param {TriggerConfig} [config] - Optional configuration for the trigger.
	 * @returns {() => void} A function to unregister the trigger.
	 * @throws {Error} If the trigger is already registered.
	 */
	register<P, D = any>(name: string, cb: (p: P) => void | Promise<void>, config?: TriggerConfig<D>): () => void {
		const { _triggers, _queue, _configs, _listeners } = this;
		if (_triggers.has(name)) {
			throw new Error(`Trigger "${name}" was already registered.`);
		}
		_triggers.set(name, cb);
		_queue.set(name, []);
		_configs.set(name, {
			limit: MAX_QUEUE_LENGTH,
			abortControllerSupport: false,
			detail: {} as D,
			...config,
			isTriggerExecuting: false,
			abortHandler: null,
		});
		if (!_listeners.has(name)) {
			_listeners.set(name, new Set());
		}
		registrator(this, name);
		return () => {
			this.abort(name);
			_triggers.delete(name);
			_queue.delete(name);
			_configs.delete(name);
			registrator(this, name);
		};
	}

	/**
	 * Registers multiple triggers.
	 *
	 * @param {Record<string, (p: any) => void | Promise<void>>} object - An object mapping trigger names to callbacks.
	 * @param {TriggerConfig} [configs] - Optional configurations for the trigger.
	 * @returns {() => void} A function to unregister all triggers.
	 */
	registerMany(
		object: Record<string, (p: any) => void | Promise<void>>,
		configs: Partial<Record<keyof typeof object, TriggerConfig>> = {}
	): () => void {
		const undo: (() => void)[] = [];
		for (const name in object) {
			undo.push(this.register(name, object[name], configs[name]));
		}
		return () => {
			undo.forEach((cb) => cb());
		};
	}

	/**
	 * Emits a trigger by name with optional properties and a completion callback.
	 *
	 * @template P - The type of the properties passed to the trigger.
	 * @param {string} name - The name of the trigger.
	 * @param {P & TriggerAbortedProps} [props] - Optional properties for the trigger, including abort properties.
	 * @param {(err?: unknown) => void} [complete] - Optional completion callback.
	 */
	emit<P = any>(
		name: string,
		props?: P | (P & TriggerAbortedProps) | undefined,
		complete?: ((err?: unknown) => void) | undefined
	): void {
		emitNext(this, name, props, complete);
	}

	/**
	 * Emits a trigger using a TriggerProp with an optional completion callback.
	 *
	 * @template P - The type of the properties passed to the trigger.
	 * @param prop - The trigger property to emit.
	 * @param complete - Optional callback invoked upon completion.
	 */
	emitProp<P = any>(prop: TriggerProp<P>, complete?: (err?: unknown) => void) {
		const { name, props } = createTriggerProp(prop);
		return this.emit<P>(name, props, complete);
	}

	/**
	 * Asynchronously emits a trigger by name with optional properties.
	 *
	 * @template P
	 * @param {string} name - The name of the trigger.
	 * @param {P & TriggerAbortedProps} [props] - Optional properties for the trigger, including abort properties.
	 * @returns {Promise<void>} A promise that resolves when the trigger completes.
	 */
	emitAsync<P = any>(name: string, props?: P | (P & TriggerAbortedProps) | undefined): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			emitNext(this, name, props, (err) => {
				if (err) {
					reject(err);
				} else {
					resolve();
				}
			});
		});
	}

	/**
	 * Asynchronously emits a trigger using a TriggerProp.
	 *
	 * @template P - The type of the properties passed to the trigger.
	 * @param prop - The trigger property to emit.
	 * @returns A promise that resolves when the trigger execution is complete.
	 */
	emitPropAsync<P = any>(prop: TriggerProp<P>): Promise<void> {
		const { name, props } = createTriggerProp(prop);
		return this.emitAsync<P>(name, props);
	}

	/**
	 * Aborts a trigger by name.
	 *
	 * @param {string} name - The name of the trigger to abort.
	 */
	abort(name: string): void {
		const config = this._configs.get(name);
		if (!config) {
			return;
		}
		const { abortHandler } = config;
		if (abortHandler != null) {
			abortHandler();
		}
	}

	/**
	 * Checks if a trigger is registered.
	 *
	 * @param {string} name - The name of the trigger.
	 * @returns {boolean} True if the trigger is registered, otherwise false.
	 */
	registered(name: string): boolean {
		return this._triggers.has(name);
	}

	/**
	 * Checks if a trigger is currently in the process of execution.
	 *
	 * @param name - The name of the trigger to check.
	 * @returns True if the trigger is executing, false otherwise.
	 */
	isTriggerExecuting(name: string): boolean {
		return this._configs.get(name)?.isTriggerExecuting || false;
	}

	/**
	 * Subscribes a listener to a trigger.
	 *
	 * @template P - The type of the properties passed to the listener.
	 * @param name - The name of the trigger.
	 * @param listener - The function to execute when the trigger is emitted.
	 * @returns A function to unsubscribe the listener.
	 */
	subscribe<P = any>(name: string, listener: (props: P) => P | undefined | null | void) {
		const { _listeners } = this;
		if (!_listeners.has(name)) {
			_listeners.set(name, new Set());
		}
		const cb: Listener<P> = (props: P): P => {
			try {
				const result = listener(props);
				if (result != null && typeof result === "object") {
					return result;
				}
			} catch (err) {
				logger.error(`Error in listener callback for trigger "${name}":`, err);
			}
			return props;
		};
		const set = _listeners.get(name)!;
		set.add(cb);
		return () => {
			set.delete(cb);
		};
	}

	/**
	 * Retrieves the public details associated with a registered trigger.
	 *
	 * @template P - The type of the detail object.
	 * @param {string} name - The name of the trigger.
	 * @returns {P} - The detail object associated with the trigger.
	 * @throws {Error} - Throws an error if the trigger is not registered.
	 */
	detail<P>(name: string): P {
		const { _configs } = this;
		const config = _configs.get(name);
		if (!config) {
			throw new Error(`Trigger "${name}" was not registered.`);
		}
		return (config as Config<P>).detail;
	}
}

export { TriggerService, TriggerAbortError };
