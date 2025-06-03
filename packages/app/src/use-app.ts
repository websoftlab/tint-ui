import * as React from "react";
import { invariant } from "@tint-ui/tools/proof";
import { AppContext } from "./context";

/**
 * React hook for accessing the app context.
 *
 * @returns The app context.
 */
const useApp = () => {
	const ctx = React.useContext(AppContext);
	invariant(ctx, "App context is not defined");
	return ctx;
};

export { useApp };
