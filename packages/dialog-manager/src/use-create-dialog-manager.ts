import type { ElementType } from "react";
import type {
	DialogContextType,
	TriggerDialogManagerProps,
	DialogManagerRegisterType,
	DialogManagerSizeType,
	DialogManagerRegisterSyncType,
	DialogManagerAsyncLoader,
} from "./types";

import * as React from "react";
import { useTrigger } from "@tint-ui/trigger";
import { createDialogContext } from "./context";
import { lockBodyScroll } from "./lock-body-scroll";
import { DialogAsyncLoader } from "./dialog-async-loader";

type IdType = {
	id: string;
	type: string;
};

type ManagerType<P = any> = Required<TriggerDialogManagerProps<P>> & {
	context: DialogContextType;
	close: () => void;
};

type Status = "close" | "to-open" | "open" | "to-close";

type ManagerState<P = any> = {
	status: Status;
	open: boolean;
	locked: boolean | string;
	manager: ManagerType | null;
	props: P;
};

const defaultState: ManagerState = {
	status: "close",
	open: false,
	locked: false,
	props: null,
	manager: null,
};

const compare = (a: IdType, b: IdType) => a.id === b.id && a.type === b.type;

const comparePlain = (a: IdType, type: string, id: string) => a.id === id && a.type === type;

export const useCreateDialogManager = (registerTypes: DialogManagerRegisterType[] = [], asyncForceDelay = 0) => {
	const trigger = useTrigger();
	const [managerState, setManagerState] = React.useState<ManagerState>(defaultState);
	const loaderRef = React.useRef(new WeakMap<DialogManagerAsyncLoader, ElementType>());
	const refDelay = React.useRef(asyncForceDelay);
	const { onMount, onOpenChange, onRegisterTypes } = React.useMemo(() => {
		let state = managerState;
		let mount = false;
		let timer = 0;
		let toClose = false;
		let toHide = false;
		let queue: ManagerType[] = [];
		let types: { node: Required<DialogManagerRegisterSyncType>; unmount: () => void }[] = [];

		const stopTimer = () => {
			if (timer) {
				window.clearTimeout(timer);
				timer = 0;
			}
		};

		const updateState = (data: Partial<ManagerState>) => {
			if (!mount) {
				return;
			}
			state = {
				...state,
				...data,
			};
			setManagerState(state);
		};

		const _close = (hide = false) => {
			// lock dialog
			if (state.locked) {
				return;
			}

			const { manager } = state;
			if (!manager) {
				return;
			}

			if (!hide) {
				// remove from queue
				const index = queue.findIndex((item) => compare(item, manager));
				if (index !== -1) {
					queue.splice(index, 1);
				}
			}

			stopTimer();
			updateState({
				open: false,
				status: "to-close",
			});

			timer = window.setTimeout(() => {
				timer = 0;
				if (!mount) {
					return;
				}
				toClose = false;
				manager.close();
				updateState({
					open: false,
					status: "close",
					props: null,
					manager: null,
				});
				_open();
			}, 300);
		};

		const _open = () => {
			if (!queue.length) {
				return;
			}
			const manager = queue[queue.length - 1];

			stopTimer();
			updateState({
				open: true,
				status: "to-open",
				props: manager.props,
				manager: manager,
			});

			timer = window.setTimeout(() => {
				timer = 0;
				if (!mount) {
					return;
				}
				updateState({
					status: "open",
				});
				if (toClose) {
					toClose = false;
					_close();
				} else if (toHide) {
					toHide = false;
					_close(true);
				}
			}, 300);
		};

		const openDialog = (props: TriggerDialogManagerProps) => {
			if (!mount) {
				return;
			}

			const index = queue.findIndex((item) => compare(item, props));
			let manager: ManagerType;
			if (index !== -1) {
				manager = queue.splice(index, 1)[0];
				manager.props = props.props;
				(["overlayClosable", "escapeClosable"] as ("overlayClosable" | "escapeClosable")[]).forEach((name) => {
					const value = props[name];
					if (typeof value === "boolean") {
						manager[name] = value;
					}
				});
			} else {
				const { type, id } = props;
				const [close, context] = createDialogContext(
					type,
					id,
					() => {
						closeDialogOnce(type, id);
					},
					(value: boolean | string) => {
						updateState({ locked: value });
					}
				);
				manager = {
					overlayClosable: true,
					escapeClosable: true,
					size: "md",
					...props,
					close,
					context,
				};
			}

			queue.push(manager);
			switch (state.status) {
				case "open":
					_close(true);
					break;
				case "close":
					_open();
					break;
				case "to-open":
					if (state.manager && compare(state.manager, manager)) {
						updateState({ props: manager.props });
					} else {
						toHide = true;
					}
					break;
			}
		};

		const closeDialog = () => {
			if (!mount || !state.open || state.locked) {
				return;
			}
			if (state.status !== "open") {
				toClose = true;
			} else {
				_close();
			}
		};

		const closeDialogOnce = (type: string, id: string) => {
			if (state.manager && comparePlain(state.manager, type, id)) {
				closeDialog();
			} else {
				const index = queue.findIndex((item) => comparePlain(item, type, id));
				if (index !== -1) {
					queue.splice(index, 1);
				}
			}
		};

		const closeDialogByType = (type: string) => {
			const copy = queue.slice();
			const { manager } = state;
			let closeCurrent = false;
			let ignoreId: string | null = null;
			if (manager && manager.type === type) {
				if (state.locked) {
					ignoreId = manager.id;
				} else {
					closeCurrent = true;
				}
			}
			queue = [];
			copy.forEach((item) => {
				if (item.type !== type || ignoreId === item.id) {
					queue.push(item);
				}
			});
			if (closeCurrent) {
				closeDialog();
			}
		};

		const closeDialogAll = () => {
			if (!mount) {
				return;
			}
			const manager = state.locked ? state.manager : null;
			queue.length = 0;
			if (manager) {
				queue.push(manager);
			} else {
				closeDialog();
			}
		};

		type IdProps = {
			id?: string;
		};

		type OpenProps = IdProps & {
			overlayClosable?: boolean;
			escapeClosable?: boolean;
			size?: DialogManagerSizeType;
		};

		const openBy = function <T>(type: string, component: ElementType, config: OpenProps, props: T) {
			const { id = type, ...rest } = config;
			openDialog({
				...rest,
				type,
				id,
				component,
				props: props,
			});
		};

		const closeBy = (type: string, id?: string) => {
			if (!id) {
				const { manager } = state;
				if (manager && manager.type === type) {
					id = manager.id;
				} else {
					return;
				}
			}
			closeDialogOnce(type, id);
		};

		const createLoaderComponent = (loader: DialogManagerAsyncLoader): ElementType => {
			const onLoad = (loadedComponent: ElementType) => {
				loaderRef.current.set(loader, loadedComponent);
				types.forEach(({ node }) => {
					if (node.component === component) {
						node.component = loadedComponent;
					}
				});
			};
			const component = (originProps: object) => {
				return React.createElement(DialogAsyncLoader, {
					loader,
					onLoad,
					originProps,
					asyncForceDelay: refDelay.current,
				});
			};
			component.displayName = `DialogAsyncLoader(${loader.name || "wrapper"})`;
			return component;
		};

		return {
			onOpenChange: (value: boolean) => {
				if (!value) {
					closeDialog();
				}
			},
			onMount: () => {
				mount = true;
				const unmount = trigger.registerMany(
					{
						dialog: openDialog,
						"dialog.close": (props: { type: string } & IdProps) => {
							const { type, id } = props;
							if (id) {
								closeDialogOnce(type, id);
							} else {
								closeDialogByType(type);
							}
						},
						"dialog.close-all": closeDialogAll,
					},
					{
						dialog: {
							detail: {
								open: openBy,
								close: closeBy,
								closeAll: closeDialogByType,
							},
						},
					}
				);
				return () => {
					mount = false;
					stopTimer();
					unmount();
					types.forEach((type) => type.unmount());
					types = [];
					queue.length = 0;
				};
			},
			onRegisterTypes: (registerTypes: DialogManagerRegisterType[]) => {
				if (!mount) {
					return;
				}
				const retype: typeof types = [];
				for (const item of registerTypes) {
					const { type, escapeClosable = true, overlayClosable = true, size = "md", detail = {} } = item;
					let component: ElementType;

					// async...
					if ("loader" in item) {
						const { loader } = item;
						if (loaderRef.current.has(loader)) {
							component = loaderRef.current.get(loader)!;
						} else {
							component = createLoaderComponent(loader);
							loaderRef.current.set(loader, component);
						}
					} else {
						component = item.component;
					}

					const index = types.findIndex((t) => t.node.type === type);
					if (index !== -1) {
						const last = types.splice(index, 1)[0];
						const { node } = last;
						node.size = size;
						node.component = component;
						node.escapeClosable = escapeClosable;
						node.overlayClosable = overlayClosable;
						if (node.detail !== detail) {
							Object.assign(node.detail, detail);
						}
						retype.push(last);
					} else {
						const node = {
							type,
							component,
							escapeClosable,
							overlayClosable,
							size,
							detail,
						};
						retype.push({
							node,
							unmount: trigger.registerMany(
								{
									[`dialog:${type}`]: (props: { id?: string }) => {
										const { id, ...rest } = props;
										openBy(
											node.type,
											node.component,
											{
												id,
												escapeClosable: node.escapeClosable,
												overlayClosable: node.overlayClosable,
												size: node.size,
											},
											rest
										);
									},
									[`dialog:${type}.close`]: (props: { id?: string }) => {
										closeBy(node.type, props.id);
									},
									[`dialog:${type}.close-all`]: () => {
										closeDialogByType(node.type);
									},
								},
								{
									[`dialog:${type}`]: {
										detail: node.detail,
									},
								}
							),
						});
					}
				}
				types.forEach((t) => t.unmount());
				types = retype;
			},
		};
	}, [trigger]);

	React.useEffect(onMount, [onMount]);
	const exit = !managerState.manager;

	React.useEffect(() => {
		if (!exit) {
			return lockBodyScroll();
		}
	}, [exit]);

	React.useEffect(() => {
		onRegisterTypes(registerTypes);
	}, [onRegisterTypes, registerTypes]);

	return {
		open: managerState.open,
		manager: managerState.manager,
		locked: managerState.locked,
		props: managerState.props,
		onOpenChange,
	};
};
