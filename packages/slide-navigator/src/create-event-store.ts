const createEventStore = () => {
	const listeners: (() => void)[] = [];
	function add(
		node: HTMLElement | Document,
		type: string,
		handler: (event: Event) => void,
		options: boolean | AddEventListenerOptions = {
			passive: true,
		}
	) {
		let removeListener;
		node.addEventListener(type, handler, options);
		removeListener = () => node.removeEventListener(type, handler, options);
		listeners.push(removeListener);
		return self;
	}
	const self = {
		add,
		clear() {
			listeners.forEach((listener) => {
				listener();
			});
			// reset
			listeners.length = 0;
		},
	};
	return self;
};

export { createEventStore };
