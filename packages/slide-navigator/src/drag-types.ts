type DragGo = {
	move(): void;
	dragStart(): boolean;
	dragMove(event: { offset: number }): void;
	dragEnd(event: { velocity: number }): void;
};

type DragGoToHandler = (
	action:
		| { type: "index"; value: number }
		| { type: "prev" }
		| { type: "next" }
		| { type: "drag"; x: number }
		| { type: "force" }
		| { type: "element"; target: HTMLElement }
) => DragGo;

export type { DragGo, DragGoToHandler };
