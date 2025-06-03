# @tint-ui/theme

A lightweight, flexible theming solution for React applications, built on top of MobX.

## Installation

> **Note:** Direct installation via `npm install` is not recommended. `@tint-ui/theme` is a core component of the tint-ui library and should be installed via the `tint-ui init` command.

```bash
npm install @tint-ui/theme
```

## Usage

The main theme configuration code is automatically generated into the `@/component/theme/index.tsx` file. This file contains the complete theme setup including styles, icons, and provider configuration that integrates all tint-ui components into a cohesive theming system.

**Important:** This file can be edited to add your own libraries and custom configurations. However, you must not rename the main variable names (`classes`, `icons`, `mixin`, `themeStore`, `types`) or remove the base components (`ThemeContext.Provider`, `TriggerProvider`, `AppProvider`) as they are essential for the proper functioning of the tint-ui ecosystem.

**Note:** The Tooltip, Toast, and Dialog managers (`TooltipProvider`, `ToastManager`, `DialogManager`) are not mandatory but are recommended for installation and configuration to provide enhanced user experience features.

```tsx
"use client";

import type { ReactNode } from "react";
import type { AppStoreOptions } from "@tint-ui/app";

import * as React from "react";
import { AppProvider } from "@tint-ui/app";
import { ThemeStore, ThemeContext } from "@tint-ui/theme";
import { TriggerProvider } from "@tint-ui/trigger";
import { ToastManager } from "@tint-ui/toast-manager";
import { TooltipProvider } from "@/tint-ui/tooltip";
import { DialogManager, type DialogManagerRegisterType } from "@tint-ui/dialog-manager";
import registerTypes from "@tint-ui/dialog-manager/register";

const classes = {
	// auto-generated styles link
};

const icons = {
	// auto-generated icons
};

const mixin = {};
const themeStore: ThemeStore = new ThemeStore({ classes, icons, mixin });
const types: DialogManagerRegisterType[] = [...registerTypes];

export function ThemeContextProvider({ children, options }: { children: ReactNode; options?: AppStoreOptions }) {
	return (
		<ThemeContext.Provider value={themeStore}>
			<TriggerProvider>
				<AppProvider options={options}>
					<TooltipProvider>
						{children}
						<ToastManager />
						<DialogManager registerTypes={types} />
					</TooltipProvider>
				</AppProvider>
			</TriggerProvider>
		</ThemeContext.Provider>
	);
}
```

Import the theme provider and use it to wrap your application:

```tsx
import { ThemeContextProvider } from "@/component/theme";

function App() {
	return <ThemeContextProvider>{/* Your app components */}</ThemeContextProvider>;
}
```

## Features

- **MobX Integration**: Leverages MobX for reactive theme updates.
- **TypeScript Support**: Fully typed for better developer experience.
- **Lightweight**: Minimal overhead, perfect for performance-critical applications.

## Dependencies

- **React**: ^16.8.0 || ^17 || ^18 || ^19
- **MobX**: ^4.15.0 || ^5 || ^6

## License

MIT
