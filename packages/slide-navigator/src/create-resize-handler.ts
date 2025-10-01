import type { SlideNavigatorApi, SlideNavigatorOptions } from "./types";
import type { DragGoToHandler } from "./drag-types";

import { mathAbs, measure, getWidth } from "./utils";
import { createDragHandler } from "./create-drag-handler";

type State = {
	drag: boolean;
	canBePrev: boolean;
	canBeNext: boolean;
	canBeDrag: boolean;
	disabled: boolean;
};

function createResizeHandler(container: HTMLElement, forceUpdate: () => void, opts: SlideNavigatorOptions) {
	let resizeObserver: ResizeObserver | null = null;
	let destroyed = false;
	let slideList: HTMLElement[] = [];
	let left = 0;
	let state: State = {
		drag: false,
		canBePrev: false,
		canBeNext: false,
		canBeDrag: false,
		disabled: typeof ResizeObserver === "undefined",
	};

	const {
		align = "start",
		startIndex = 0,
		dragConfig: { threshold = 2, friction = 0.95, multiplier = 1 } = {},
	} = opts;

	const ownerWindow = container.ownerDocument.defaultView || window;
	const isRequestAnimation = ownerWindow.requestAnimationFrame != null;
	const frameRate = isRequestAnimation ? 0.016 : 0.04; // 60 FPS (1/60 ≈ 0.016 sec) OR (1/25 ≈ 0.04 sec)
	const sizeCalc = new WeakMap<HTMLElement, number>();
	const dragThreshold = threshold > 0.3 ? threshold : 2;
	const velocityFriction = friction > 0 && friction < 1 ? friction : 0.95;
	const velocityMultiplier = multiplier > 0 && multiplier < 5 ? multiplier : 1;

	let playId: number | null = null;

	const setLeft = (value: number) => {
		left = value;
		container.style.transform = `translateX(${-left}px)`;
	};

	const updateState = (data: Partial<State>) => {
		//canBeDrag
		let update = false;
		const keys = Object.keys(data) as (keyof State)[];
		for (const key of keys) {
			const value = data[key]!;
			if (value !== state[key]) {
				state[key] = value;
				update = true;
			}
		}
		if (update) {
			forceUpdate();
		}
	};

	const startDrag = (fn: () => void) => {
		const trigger = () => {
			playId = null;
			fn();
		};
		playId = isRequestAnimation ? ownerWindow.requestAnimationFrame(trigger) : window.setTimeout(trigger, 40);
	};

	const stopDrag = () => {
		if (playId != null) {
			if (isRequestAnimation) {
				ownerWindow.cancelAnimationFrame(playId);
			} else {
				ownerWindow.clearTimeout(playId);
			}
			playId = null;
		}
	};

	const goTo: DragGoToHandler = (action) => {
		stopDrag();

		let calculate = slideList.map(measure);
		if (calculate.length > 1) {
			calculate = calculate.sort((a, b) => a.left - b.left);
		}

		const containerWidth = getWidth(container);
		const fullWidth = calculate.length > 0 ? calculate[calculate.length - 1].right : 0;
		const minVelocity = 0.1;

		let maxLeft = 0;
		let newLeft = 0;
		let dragLeft = 0;
		let canBeDrag = false;
		let isDrag = false;
		let isDragType = false;

		const fixLeft = (value?: number) => {
			if (value != null) {
				newLeft = value;
			}
			if (newLeft < 0) {
				newLeft = 0;
			} else if (newLeft > maxLeft) {
				newLeft = maxLeft;
			} else {
				return false;
			}
			return true;
		};

		if (containerWidth >= fullWidth) {
			switch (align) {
				case "center":
					newLeft = (fullWidth - containerWidth) / 2;
					break;
				case "end":
					newLeft = fullWidth - containerWidth;
					break;
			}
		} else {
			canBeDrag = true;
			maxLeft = fullWidth - containerWidth;
			switch (action.type) {
				case "next":
				case "prev":
					let currentIndex = 0;

					if (left > 0 && fullWidth > containerWidth)
						for (let i = 0; i < calculate.length; i++) {
							const calc = calculate[i];
							if ((left > calc.left && left < calc.right) || (i === 0 && left <= calc.left)) {
								currentIndex = i;
								break;
							} else {
								const ni = i + 1;
								if (ni < calculate.length && left >= calc.right && left <= calculate[ni].left) {
									currentIndex = ni;
									break;
								}
							}
						}

					if (action.type === "prev") {
						if (currentIndex > 0) {
							currentIndex--;
						}
					} else if (currentIndex + 1 < calculate.length) {
						currentIndex++;
					}

					if (currentIndex > 0) {
						newLeft = calculate[currentIndex].left;
						if (newLeft > maxLeft) {
							newLeft = maxLeft;
						}
					}
					break;
				case "index":
					const index = action.value;
					if (index > 0) {
						if (index < calculate.length) {
							newLeft = calculate[index].left;
						} else {
							newLeft = calculate[calculate.length - 1].left;
						}
						if (newLeft > maxLeft) {
							newLeft = maxLeft;
						}
					}
					break;
				case "drag":
					if (canBeDrag) {
						isDragType = true;
					}
					break;
				case "force":
					fixLeft(left);
					break;
				case "element":
					const el = action.target;
					const match = calculate.find((item) => item.node === el || item.node.contains(el));

					if (!match) {
						newLeft = left;
					} else {
						const nodeLeft = match.left;
						const nodeRight = match.right;

						if (nodeLeft < left) {
							newLeft = nodeLeft - 16;
						} else if (nodeRight > left + containerWidth) {
							newLeft = nodeRight - containerWidth + 16;
						} else {
							newLeft = left;
						}

						fixLeft();
					}
					break;
			}
		}

		const updateStateDrag = () => {
			updateState({
				canBeDrag,
				canBeNext: canBeDrag && newLeft < maxLeft,
				canBePrev: canBeDrag && newLeft > 0,
				drag: false,
			});
		};

		const _move = (value?: number) => {
			if (value != null) {
				newLeft = value;
			}
			updateStateDrag();
			const fn = () => {
				const delta = newLeft - left;
				if (mathAbs(delta) < 0.25) {
					setLeft(newLeft);
				} else {
					setLeft(left + delta / 3);
					startDrag(fn);
				}
			};
			fn();
		};

		return {
			dragStart() {
				if (!isDragType) {
					return false;
				}
				isDragType = false;
				isDrag = true;
				dragLeft = left;
				updateState({ canBeDrag: true, drag: true });
				return true;
			},
			dragMove(event) {
				if (!isDrag) {
					return;
				}
				let leftValue = dragLeft + event.offset;
				if (leftValue < 0) {
					leftValue /= 3;
				} else if (leftValue > maxLeft) {
					leftValue = maxLeft + (leftValue - maxLeft) / 3;
				}
				setLeft(leftValue);
			},
			dragEnd(event) {
				if (!isDrag) {
					return;
				}

				isDrag = false;
				if (left < 0) {
					return _move(0);
				}
				if (left > maxLeft) {
					return _move(maxLeft);
				}

				let velocity = event.velocity;
				if (velocity === 0) {
					return updateStateDrag();
				}

				if (velocityMultiplier !== 1) {
					velocity *= velocityMultiplier;
				}
				newLeft = left;
				const fn = () => {
					velocity *= velocityFriction;
					const complete = fixLeft(newLeft - velocity * frameRate) || mathAbs(velocity) <= minVelocity;
					setLeft(newLeft);
					if (complete) {
						updateStateDrag();
					} else {
						startDrag(fn);
					}
				};

				fn();
			},
			move() {
				_move();
			},
		};
	};

	const dragHandler = state.disabled ? null : createDragHandler(container, goTo, ownerWindow, dragThreshold);
	const api: SlideNavigatorApi = {
		get drag(): boolean {
			return state.drag;
		},
		get canBePrev(): boolean {
			return state.canBePrev;
		},
		get canBeNext(): boolean {
			return state.canBeNext;
		},
		get canBeDrag(): boolean {
			return state.canBeDrag;
		},
		get disabled(): boolean {
			return state.disabled;
		},
		update(force: boolean = false) {
			if (destroyed) {
				return;
			}
			if (reloadChildrenSlides() || force) {
				goTo({ type: "force" }).move();
			}
		},
		goPrev() {
			goTo({ type: "prev" }).move();
		},
		goNext() {
			goTo({ type: "next" }).move();
		},
	};

	const reload = (latest: HTMLElement[], node: HTMLElement) => {
		const index = latest.indexOf(node);
		if (index === -1) {
			slideList.push(node);
			if (resizeObserver) {
				resizeObserver.observe(node);
			}
			sizeCalc.set(node, getWidth(node));
			return true;
		}
		latest.splice(index, 1);
		sizeCalc.delete(node);
		return false;
	};

	const reloadChildrenSlides = () => {
		const child = container.querySelectorAll("[data-type='slide']");
		const latest = slideList.slice();
		let updated = false;
		if (child.length) {
			child.forEach((el) => {
				if (reload(latest, el as HTMLElement)) {
					updated = true;
				}
			});
		} else if (container.firstChild != null) {
			let child: ChildNode | null = container.firstChild;
			while (child != null) {
				if (child.nodeType === 1) {
					if (reload(latest, child as HTMLElement)) {
						updated = true;
					}
				}
				child = child.nextSibling;
			}
		}
		// reset latest
		if (latest.length) {
			updated = true;
		}
		for (const node of latest) {
			if (resizeObserver) {
				resizeObserver.unobserve(node);
			}
			const index = slideList.indexOf(node);
			if (index !== -1) {
				slideList.splice(index, 1);
			}
		}
		return updated;
	};

	function resizeHandler(entries: ResizeObserverEntry[]) {
		let update = false;

		for (const entry of entries) {
			const target = entry.target as HTMLElement;
			const lastSize = sizeCalc.get(target);
			if (lastSize == null) {
				continue;
			}

			const newSize = getWidth(target);
			if (mathAbs(newSize - lastSize) >= 0.5) {
				sizeCalc.set(target, newSize);
				update = true;
			}
		}

		if (update) {
			goTo({ type: "force" }).move();
		}
	}

	if (state.disabled) {
		return { api, destroy() {} };
	}

	resizeObserver = new ResizeObserver(resizeHandler);

	const init = () => {
		if (destroyed) {
			return;
		}
		if (dragHandler) {
			dragHandler.init();
		}
		if (resizeObserver) {
			resizeObserver.observe(container);
		}
		sizeCalc.set(container, getWidth(container));
		reloadChildrenSlides();
		goTo({ type: "index", value: startIndex }).move();
	};

	if (isRequestAnimation) {
		ownerWindow.requestAnimationFrame(init);
	} else {
		ownerWindow.setTimeout(init, 16);
	}

	return {
		api,
		destroy() {
			destroyed = true;
			if (resizeObserver) {
				resizeObserver.disconnect();
				resizeObserver = null;
			}
			if (dragHandler) {
				dragHandler.destroy();
			}
		},
	};
}

export { createResizeHandler };
