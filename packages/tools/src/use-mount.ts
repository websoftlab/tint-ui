"use client";

import * as React from "react";

/**
 * React hook for checking if the component is mounted.
 *
 * @returns {boolean} True if the component is mounted, false otherwise.
 */
const useMount = (): boolean => {
	const [mount, setMount] = React.useState(false);
	React.useEffect(() => {
		setMount(true);
	}, []);
	return mount;
};

export { useMount };
