/**
 * Log levels for the logger.
 */
type LogLevel = "debug" | "info" | "warn" | "error";

/**
 * Listener for log events.
 */
type LogListener = (info: { level: LogLevel; message: unknown[] }) => void;

/**
 * Configuration options for the Logger.
 */
interface LoggerOptions {
	/** Minimum log level to output. Defaults to "info". */
	level?: LogLevel;
	/** Whether to include timestamps in log messages. Defaults to true. */
	withTimestamp?: boolean;
	/** Optional prefix for all log messages. */
	prefix?: string;
}

class Logger {
	/**
	 * Priority mapping for log levels to control which levels are logged.
	 */
	private levelPriority: Record<LogLevel, number> = {
		debug: 1,
		info: 2,
		warn: 3,
		error: 4,
	};

	private currentLevel: LogLevel;
	private withTimestamp: boolean;
	private prefix: string;
	private listeners: Set<LogListener> = new Set();

	/**
	 * Create a new Logger instance.
	 * @param {LoggerOptions} options - Configuration options for the logger.
	 */
	constructor(options: LoggerOptions = {}) {
		this.currentLevel = options.level || "info";
		this.withTimestamp = options.withTimestamp ?? true;
		this.prefix = options.prefix || "";
	}

	/**
	 * Determine whether a message at the given level should be logged.
	 * @param {LogLevel} level - The log level of the message.
	 * @returns {boolean} Whether the message should be logged.
	 */
	private shouldLog(level: LogLevel): boolean {
		return this.levelPriority[level] >= this.levelPriority[this.currentLevel];
	}

	/**
	 * Format a log message with optional timestamp, level, and prefix.
	 * @param {LogLevel} level - The log level of the message.
	 * @param {unknown[]} message - The message content.
	 * @returns {string} The formatted log message.
	 */
	private formatMessage(level: LogLevel, message: unknown[]): string {
		let format = "";
		if (this.withTimestamp) {
			format += `[${new Date().toISOString()}] `;
		}
		format += `[${level.toUpperCase()}] `;
		if (this.prefix) {
			format += `[${this.prefix}] `;
		}
		return format + message.map(String).join(" ");
	}

	/**
	 * Log a message at the specified level.
	 * @param {LogLevel} level - The log level.
	 * @param {...unknown[]} message - The log message(s).
	 */
	private log(level: LogLevel, ...message: unknown[]): void {
		if (!this.shouldLog(level)) return;

		this.listeners.forEach((cb) => {
			cb({ level, message });
		});

		const formattedMessage = this.formatMessage(level, message);
		switch (level) {
			case "debug":
				console.debug(formattedMessage);
				break;
			case "info":
				console.info(formattedMessage);
				break;
			case "warn":
				console.warn(formattedMessage);
				break;
			case "error":
				console.error(formattedMessage);
				break;
		}
	}

	/**
	 * Set the minimum log level for this logger.
	 * @param {LogLevel} level - The log level to set.
	 */
	setCurrentLevel(level: LogLevel): void {
		if (level in this.levelPriority) {
			this.currentLevel = level;
		}
	}

	/**
	 * Enable or disable timestamps in log messages.
	 * @param {boolean} value - Whether to enable timestamps.
	 */
	setTimestamp(value: boolean): void {
		this.withTimestamp = value;
	}

	/**
	 * Set a prefix for all log messages.
	 * @param {string} value - The prefix to set.
	 */
	setPrefix(value: string): void {
		this.prefix = value;
	}

	/**
	 * Subscribe a listener to log events.
	 * @param {LogListener} cb - The callback to invoke on log events.
	 * @returns {() => void} A function to unsubscribe the listener.
	 */
	subscribe(cb: LogListener): () => void {
		this.listeners.add(cb);
		return () => {
			this.listeners.delete(cb);
		};
	}

	/**
	 * Log a debug-level message.
	 * @param {...unknown[]} message - The message content.
	 */
	debug(...message: unknown[]): void {
		this.log("debug", ...message);
	}

	/**
	 * Log an info-level message.
	 * @param {...unknown[]} message - The message content.
	 */
	info(...message: unknown[]): void {
		this.log("info", ...message);
	}

	/**
	 * Log a warn-level message.
	 * @param {...unknown[]} message - The message content.
	 */
	warn(...message: unknown[]): void {
		this.log("warn", ...message);
	}

	/**
	 * Log an error-level message.
	 * @param {...unknown[]} message - The message content.
	 */
	error(...message: unknown[]): void {
		this.log("error", ...message);
	}
}

// Set the default log level based on the environment.
let level: LogLevel = "info";

if (typeof process !== "undefined" && process.env.NODE_ENV) {
	switch (process.env.NODE_ENV) {
		case "production":
			level = "error";
			break;
		case "test":
			level = "debug";
			break;
	}
}

/**
 * Default logger instance for global use.
 */
const logger = new Logger({
	level,
	withTimestamp: true,
});

export { Logger, logger };
export type { LogLevel, LoggerOptions };
