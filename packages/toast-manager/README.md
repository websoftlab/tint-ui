# @tint-ui/toast-manager

A toast notification manager for React applications, built on top of [sonner](https://github.com/emilkowalski/sonner).

## Installation

> **Note:** The recommended installation method is via the `tint-ui add` command. This will automatically install the component with all necessary dependencies and configurations.

If you are installing manually (not via `tint-ui add`), you must also install the `sonner` dependency:

```bash
npm install --save @tint-ui/toast-manager sonner
```

## Usage

### Manual Integration

To use the toast manager, you need to manually add the `<ToastManager />` component to your theme file. Here's an example of how to integrate it:

```tsx
import { ToastManager } from '@tint-ui/toast-manager';

// ... auto-generated source ...

// In your theme file (e.g., @/components/theme/index.tsx)
export function ThemeContextProvider({ children, options }: { children: ReactNode; options?: AppStoreOptions }) {
  return (
    <ThemeContext.Provider value={themeStore}>
      <TriggerProvider>
        <AppProvider options={options}>
          <TooltipProvider>
            {children}
            <TriggerManager />
            <ToastManager /> {/* Add this line */}
            <DialogManager registerTypes={types} />
          </TooltipProvider>
        </AppProvider>
      </TriggerProvider>
    </ThemeContext.Provider>
  );
}
```

### Using with Trigger System

The toast manager integrates with the trigger system. You can show toasts by emitting trigger events:

```tsx
import { Button, ButtonTrigger } from "@tint-ui/button";
import { useTrigger, useTriggerEventHandler } from "@tint-ui/trigger";

// Recommended approach using useTriggerEventHandler

const ToastButton1 = (props: { message: string }) => {
    const { clickHandler, loading } = useTriggerEventHandler({
        trigger: {
            name: "toast",
            props,
        }
    });
    return (
        <Button onClick={clickHandler} loading={loading}>Open toast</Button>
    );
};

// Or using ButtonTrigger component, which is the same Button + useTriggerEventHandler under the hood

const ToastButton2 = (props: { message: string }) => {
    return (
        <ButtonTrigger trigger={{ name: "trigger", props }}>Open toast</ButtonTrigger>
    )
};

// Or you can use useTrigger directly to call toast, for more details on how useTrigger works, see the documentation

const ToastButton3 = (props: { message: string }) => {
    const trigger = useTrigger();
    const clickHandler = () => {
        trigger.emitProp("toast", props); // or trigger.emit({ name: "toast", props });
    };
    return (
        <Button onClick={clickHandler}>Open toast</Button>
    )
};
```

## Features

- **Sonner Integration**: Leverages [sonner](https://github.com/emilkowalski/sonner) for beautiful, customizable toast notifications.
- **TypeScript Support**: Fully typed for better developer experience.

## Dependencies

- **React**: ^16.8.0 || ^17 || ^18 || ^19
- **sonner**: ^1.7

## License

MIT
