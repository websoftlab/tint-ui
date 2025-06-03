/**
 * Represents a trigger property, which can be a string, an object with a name,
 * or an object with a name and additional properties.
 * @template P - The type of additional properties.
 */
export type TriggerProp<P = any> = string | [string] | [string, P] | { name: string } | { name: string; props: P };

/**
 * Represents the optional properties for aborting a trigger.
 */
export type TriggerAbortedProps = {
	/**
	 * Optional handler that executes when the trigger is aborted
	 */
	abortHandler?: undefined | (() => void);
	/**
	 * Timeout for the abort process in milliseconds
	 */
	abortTimeout?: undefined | number;
};

/**
 * Configuration options for a trigger.
 */
export interface TriggerConfig<D = any> {
	/**
	 * Optional limit for the number of simultaneous executions.
	 */
	limit?: number;

	/**
	 * Whether to support abort controllers.
	 */
	abortControllerSupport?: boolean;

	/**
	 * Trigger public details.
	 * This can store metadata or additional information associated with the trigger.
	 * @template D - The type of the detail object.
	 */
	detail?: D;
}

type Promisify<R> = R | Promise<R>;

export interface TriggerServiceImpl {
	register<P>(name: string, cb: (p: P) => Promisify<void>, config?: TriggerConfig): () => void;
	registerMany(
		object: Record<string, (p: any) => Promisify<void>>,
		configs?: Partial<Record<keyof typeof object, TriggerConfig>>
	): () => void;
	emit<P = any>(name: string, props?: P | (P & TriggerAbortedProps), complete?: (err?: unknown) => void): void;
	emitProp<P = any>(prop: TriggerProp<P>, complete?: (err?: unknown) => void): void;
	emitAsync<P = any>(name: string, props?: P | (P & TriggerAbortedProps)): Promise<void>;
	emitPropAsync<P = any>(prop: TriggerProp<P>): Promise<void>;
	abort(name: string): void;
	registered(name: string): boolean;
	isTriggerExecuting(name: string): boolean;
	subscribe<P = any>(name: string, listener: (props: P) => P | undefined | null | void): () => void;
	detail<P>(name: string): P;
}
