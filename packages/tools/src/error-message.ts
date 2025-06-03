const read = (message: string, defaultMessage: string | null): ErrorMessageType => {
	message = String(message).trim();
	if (!message.length) {
		return { message: defaultMessage == null ? "Unknown error" : defaultMessage };
	}
	return { message };
};

/**
 * Represents an error message.
 *
 * @property {string} message - The error message.
 */
type ErrorMessageType = {
	message: string;
};

/**
 * Creates an error message from an unknown error object.
 *
 * @param {unknown} err - The error object to create a message from.
 * @param {string | null} defaultMessage - The default message to use if the error object does not have a message.
 * @returns {ErrorMessageType} The error message.
 */
const errorMessage = (err: unknown, defaultMessage: string | null = null): ErrorMessageType => {
	if (typeof err === "string") {
		return read(err.trim(), defaultMessage);
	}
	if (err instanceof Error) {
		return read(err.message, defaultMessage);
	}
	if (err != null && (typeof err === "object" || typeof err === "function")) {
		if ("message" in err) {
			return read(err.message as string, defaultMessage);
		}
		if ("error" in err) {
			return read(err.error as string, defaultMessage);
		}
		if ("toString" in err && typeof err.toString === "function") {
			return read(err.toString() as string, defaultMessage);
		}
	}
	return read("", defaultMessage);
};

export { errorMessage };
export type { ErrorMessageType };
