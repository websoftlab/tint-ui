function measure(node: HTMLElement) {
	const { offsetLeft, offsetWidth } = node;
	return {
		node,
		right: offsetLeft + offsetWidth,
		left: offsetLeft,
		width: offsetWidth,
	};
}

function getWidth(node: HTMLElement) {
	return measure(node).width;
}

function mathAbs(n: number) {
	return Math.abs(n);
}

function deltaAbs(valueB: number, valueA: number) {
	return mathAbs(valueB - valueA);
}

function isMouseEvent(evt: Event, ownerWindow: typeof window): evt is MouseEvent {
	return typeof ownerWindow.MouseEvent !== "undefined" && evt instanceof ownerWindow.MouseEvent;
}

function getClientX(evt: Event, ownerWindow: typeof window) {
	if (isMouseEvent(evt, ownerWindow)) {
		return evt.clientX;
	}
	let point = (evt as TouchEvent).touches[0];
	if (point) {
		return point.clientX;
	}
	point = (evt as TouchEvent).changedTouches[0];
	if (point) {
		return point.clientX;
	}
	return 0;
}

export { measure, getWidth, mathAbs, deltaAbs, isMouseEvent, getClientX };
