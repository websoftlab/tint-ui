# @tint-ui/trigger

A package for managing events by name/property. Events are registered and triggered through a central service.

## Installation

```bash
npm install --save @tint-ui/trigger
```

## Usage

### Integration

To use the trigger system, add the `TriggerProvider` to your main theme file:

```tsx
import { TriggerProvider } from "@tint-ui/trigger";

// In your theme file (e.g., @/components/theme/index.tsx)
export function ThemeContextProvider({ children, options }: { children: ReactNode; options?: AppStoreOptions }) {
	return (
		<ThemeContext.Provider value={themeStore}>
			<TriggerProvider>
				<AppProvider options={options}>
					<TooltipProvider>
						{children}
						{/* Other managers required for application functionality */}
					</TooltipProvider>
				</AppProvider>
			</TriggerProvider>
		</ThemeContext.Provider>
	);
}
```

### Available Commands

The trigger service provides the following commands:

- **register**: Register a new event handler. Returns a cleanup function that can be used in useEffect to unregister the event.
- **registerMany**: Register multiple event handlers at once. Returns a cleanup function.
- **emit**: Trigger an event by name.
- **emitProp**: Trigger an event by property name.
- **emitAsync**: Async trigger an event by name.
- **emitPropAsync**: Async trigger an event by property name.
- **abort**: Abort trigger execution.
- **registered**: Check if a trigger is registered in the service.
- **isTriggerExecuting**: Check if a trigger is currently executing (for async calls).
- **subscribe**: Subscribe to trigger calls to manipulate properties or for logging.
- **detail**: Get registered trigger properties.

### useTriggerEventHandler Hook

The `useTriggerEventHandler` hook simplifies event handling in components:

```tsx
import { useTriggerEventHandler } from "@tint-ui/trigger";

const MyComponent = (props: object) => {
	const { clickHandler, loading } = useTriggerEventHandler({
		trigger: {
			name: "trigger-name",
			props,
		},
	});

	return (
		<button onClick={clickHandler} disabled={loading}>
			Trigger Event
		</button>
	);
};
```

### Registering Additional Events

To register additional events, use the trigger service:

```tsx
import { useTrigger } from "@tint-ui/trigger";

const MyComponent = () => {
	const trigger = useTrigger();

	useEffect(() => {
		// Register a custom event
		return trigger.register("customEvent", (props) => {
			console.log("Custom event triggered with props:", props);
		});
	}, []);

	return <button onClick={() => trigger.emit("customEvent", { data: "example" })}>Trigger Custom Event</button>;
};
```

## Features

- **Centralized Event Management**: Register and trigger events by name or property.
- **TypeScript Support**: Fully typed for better developer experience.
- **React Integration**: Hooks for easy event handling in components.

## Dependencies

- **React**: ^16.8.0 || ^17 || ^18 || ^19

## License

MIT
