import * as React from "react";
import { invariant } from "@tint-ui/tools/proof";
import { AppMountContext } from "./context";

/**
 * React hook for checking if the app is mounted.
 *
 * @returns {boolean} True if the app is mounted, false otherwise.
 */
const useAppMount = (): boolean => {
	const ctx = React.useContext(AppMountContext);
	invariant(ctx, "AppMount context is not defined");
	const [mount, setMount] = React.useState(ctx.mount);
	React.useEffect(
		() =>
			ctx.subscribe(() => {
				setMount(true);
			}),
		[]
	);
	return mount;
};

export { useAppMount };
