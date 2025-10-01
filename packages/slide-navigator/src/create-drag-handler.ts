import type { DragGoToHandler, DragGo } from "./drag-types";

import { createEventStore } from "./create-event-store";
import { deltaAbs, isMouseEvent, getClientX } from "./utils";

const focusNodes = ["INPUT", "SELECT", "TEXTAREA"];
const nonPassiveEvent = {
	passive: false,
};

function createDragHandler(
	rootNode: HTMLElement,
	goTo: DragGoToHandler,
	ownerWindow: typeof window,
	dragThreshold: number = 2
) {
	const initEvents = createEventStore();
	const dragEvents = createEventStore();

	let preventClick = false;
	let isMouse = false;
	let dragGo: DragGo | null = null;
	let isDrag = false;

	// inertia
	let startX = 0;
	let currentX = 0;
	let lastDirection = 0;
	let velocityTracker: { x: number; time: number }[] = [];
	let maxVelocityPoints = 5;

	function addVelocityPoint(x: number) {
		const currentDirection = x > 0 ? 1 : x < 0 ? -1 : 0;
		const point = { x, time: Date.now() };

		if (currentDirection !== 0 && lastDirection !== 0 && currentDirection !== lastDirection) {
			velocityTracker = [point];
		} else {
			velocityTracker.push(point);
			if (velocityTracker.length > maxVelocityPoints) {
				velocityTracker.shift();
			}
		}

		lastDirection = currentDirection;
	}

	function calculateVelocity() {
		if (velocityTracker.length < 2) {
			return 0;
		}

		const first = velocityTracker[0];
		const last = velocityTracker[velocityTracker.length - 1];
		const deltaXTotal = last.x - first.x;
		const deltaTime = (last.time - first.time) / 1000;

		return deltaTime > 0 ? deltaXTotal / deltaTime : 0;
	}

	function init() {
		const node = rootNode;
		initEvents
			.add(node, "focusin", onFocusIn, true)
			.add(node, "dragstart", (evt) => evt.preventDefault(), nonPassiveEvent)
			.add(node, "touchmove", () => undefined, nonPassiveEvent)
			.add(node, "touchend", () => undefined)
			.add(node, "touchstart", down)
			.add(node, "mousedown", down)
			.add(node, "touchcancel", up)
			.add(node, "contextmenu", up)
			.add(node, "click", click, true);
	}

	function onFocusIn(evt: Event) {
		const target = evt.target as HTMLElement;
		if (dragGo || !target || !rootNode.contains(target)) {
			return;
		}

		const tag = target.tagName;
		const isFocusable =
			tag === "BUTTON" ||
			target.getAttribute("role") === "button" ||
			tag === "A" ||
			target.hasAttribute("tabindex") ||
			target.tabIndex !== -1;

		if (isFocusable) {
			goTo({ type: "element", target }).move();
		}
	}

	function destroy() {
		initEvents.clear();
		dragEvents.clear();
	}

	function addDragEvents() {
		const node = isMouse ? rootNode.ownerDocument : rootNode;
		dragEvents
			.add(node, "touchmove", move, nonPassiveEvent)
			.add(node, "touchend", up)
			.add(node, "mousemove", move, nonPassiveEvent)
			.add(node, "mouseup", up)
			.add(node, "selectstart", (evt) => evt.preventDefault());
	}

	function isFocusNode(node: HTMLElement) {
		return focusNodes.includes(node.nodeName || "");
	}

	function down(evt: Event) {
		const isMouseEvt = isMouseEvent(evt, ownerWindow);
		if ((isMouseEvt && (evt as MouseEvent).button !== 0) || isFocusNode(evt.target as HTMLElement)) {
			return;
		}

		const point = goTo({ type: "drag", x: startX });
		if (!point.dragStart()) {
			return;
		}

		evt.preventDefault();

		dragGo = point;
		isMouse = isMouseEvt;
		isDrag = false;
		startX = getClientX(evt, ownerWindow);
		lastDirection = 0;
		currentX = startX;
		velocityTracker = [];
		addDragEvents();
		addVelocityPoint(startX);
	}

	function move(evt: Event) {
		const isTouchEvt = !isMouseEvent(evt, ownerWindow);
		if (isTouchEvt && (evt as TouchEvent).touches.length >= 2) {
			return up(evt);
		}

		currentX = getClientX(evt, ownerWindow);
		if ((!isMouse && !evt.cancelable) || !dragGo) {
			return up(evt);
		}

		evt.preventDefault();

		if (!isDrag) {
			const diffScroll = deltaAbs(currentX, startX);
			if (diffScroll > dragThreshold) {
				preventClick = true;
				isDrag = true;
				try {
					ownerWindow.getSelection()?.removeAllRanges();
				} catch (err) {}
				rootNode.style.userSelect = "none";
			}
		}

		addVelocityPoint(currentX);
		if (isDrag) {
			dragGo.dragMove({ offset: startX - currentX });
		}
	}

	function up(evt: Event) {
		isMouse = false;
		dragEvents.clear();

		if (dragGo) {
			evt.preventDefault();
			dragGo.dragEnd({ velocity: isDrag ? calculateVelocity() : 0 });
			if (isDrag) {
				isDrag = false;
				rootNode.style.userSelect = "";
			}
			dragGo = null;
		}
	}

	function click(evt: Event) {
		if (preventClick) {
			evt.stopPropagation();
			evt.preventDefault();
			preventClick = false;
		}
	}

	return {
		init,
		destroy,
	};
}

export { createDragHandler };
