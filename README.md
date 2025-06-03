# Tint UI

A modern, flexible, and customizable React component library built with TypeScript and Tailwind CSS. Tint UI provides a comprehensive set of UI components designed for building beautiful and responsive web applications.

## Overview

Tint UI is a modular component library that follows a component-first approach, allowing developers to import only the components they need. Each component is packaged separately, ensuring optimal bundle size and flexibility in usage.

## Key Features

- 🧩 **Modular Architecture**: Each component is a separate package, allowing for selective imports
- 🎨 **Tailwind CSS Integration**: Built on top of Tailwind CSS for consistent styling and easy customization
- 📦 **TypeScript Support**: Full TypeScript support with comprehensive type definitions
- 🎯 **Component-First Design**: Each component is self-contained and independently usable
- 🔄 **Theme System**: Centralized theme management through the `@tint-ui/theme` package
- 🎭 **Customizable Styling**: Individual style modules for each component
- 🚀 **Modern React**: Built for React 16.8+ with hooks support
- 📱 **Responsive Design**: Mobile-first approach with responsive components
- 🔌 **Extensible**: Easy to extend and customize through adapters and plugins
- 🏗️ **Radix UI Foundation**: Many components are built on top of Radix UI primitives for accessibility and functionality
- 🔔 **Sonner Integration**: Toast notifications powered by Sonner for a modern notification experience

## Third-Party Integrations

Tint UI leverages several powerful libraries to provide the best possible developer experience:

- **Radix UI**: Many components are built on top of Radix UI primitives, providing:

    - Unstyled, accessible components
    - Keyboard navigation
    - Focus management
    - ARIA attributes
    - Component composition

- **Sonner**: The toast notification system (`@tint-ui/toast-manager`) is built on top of Sonner, offering:
    - Beautiful, minimal toast notifications
    - Customizable animations
    - Trigger-based API
    - Mobile-friendly design

## Styling Architecture

Tint UI uses a unique styling approach that combines Tailwind CSS with component-specific style modules:

- Each component package contains its own style definitions
- Styles are modular and can be customized per component
- The `@tint-ui/theme` package serves as the central theme manager
- Theme generation is mostly automated but can be customized
- Component properties can be overridden for testing purposes or setting base styles

### Style Project Structure

```
src/
  ├── layout.tsx
  ├── base.css
  └── components/
      ├── component-name/
      │   └── component.module.scss
      └── theme/
          └── index.tsx [auto-generated theme files]
```

## Installation

Before installation, make sure to:

1. Install Tailwind CSS v3
2. Add the main styles file where you include `@tailwind base;` to define and add styles
3. Configure paths in `tsconfig.json` for the main project directory, for example: `"paths": { "@/*": ["./src/*"] }`
4. Install `tint-ui-core` package
5. Then run the installation and follow the instructions

```bash
npx tint-ui init
```

Install individual components as needed, use the CLI tool to add components with all necessary dependencies.\
After running the command, you will be presented with a menu to select the components you need:

```bash
npx tint-ui add
```

Or manual (not recommened):

```bash
npm install @tint-ui/button @tint-ui/input
```

## Basic Usage

Root layout

```tsx
import * as React from "react";
import { ThemeContextProvider } from "@/component/theme";
import "./base.css"; // Import base theme styles

export default function RootLayout(props: { children: React.ReactNode }) {
	return <ThemeContextProvider>{props.children}</ThemeContextProvider>;
}
```

Page or component inside RootLayout

```tsx
import { Button } from "@tint-ui/button";
import { Input } from "@tint-ui/input";

export function MyComponent() {
	// some functions ...
	return (
		<div>
			<Input placeholder="Enter text..." />
			<Button>Click me</Button>
		</div>
	);
}
```

## Available Packages

- `tint-ui-core` - Core development library for component installation, dependency management, and component scaffolding
- `@tint-ui/tools` - Utility functions and hooks
- `@tint-ui/theme` - Core theme system and style management

### Tools

- `@tint-ui/app` - Base state manager for applications, supports internationalization, string template loading, variable substitution, and formatting
- `@tint-ui/trigger` - Event trigger system, base system for calling popups, messages (toast), and other system components

### Managers

- `@tint-ui/dialog-manager` - Dialog system, calling dialog window templates via trigger
- `@tint-ui/toast-manager` - Toast notification system (powered by Sonner)

### Components

- `@tint-ui/alert` - Standard alert blocks, including schema-based builder
- `@tint-ui/avatar` - Avatar components, including schema-based builder
- `@tint-ui/badge` - Badge
- `@tint-ui/breadcrumb` - Breadcrumbs
- `@tint-ui/button` - Button components, includes ButtonTrigger component for triggering events via trigger object
- `@tint-ui/card` - Cards, base elements
- `@tint-ui/command` - Components for building command lines and lists
- `@tint-ui/dialog` - Dialog and modal components
- `@tint-ui/dropdown-menu` - Dropdown menu component
- `@tint-ui/form-grid` - Form grid system, builder for creating forms. Uses "react-hook-form" and "zod"
- `@tint-ui/form-input-group` - Input field grouping with "react-hook-form" and adapters
- `@tint-ui/input` - Input fields, text & textarea
- `@tint-ui/input-checkbox` - Checkboxes, radio buttons, label group combination
- `@tint-ui/input-password` - Password input field
- `@tint-ui/input-select` - Replacement for standard select component, with filtering, multiple selection, grouping
- `@tint-ui/popover` - Popup blocks, mainly base for other components
- `@tint-ui/separator` - Separator
- `@tint-ui/svg-icon` - SVG icons, base for icons in other components, can be modified in main theme file, supports dynamic loading
- `@tint-ui/table` - Table skeleton
- `@tint-ui/tooltip` - Tooltips for individual elements, requires provider connection in base theme

## Customization

Each component's styles can be customized by:

1. Modifying the component's style module
2. Extending the theme through the theme system
3. Using Tailwind's configuration
4. Creating custom adapters

## License

MIT
