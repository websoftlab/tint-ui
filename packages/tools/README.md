# @tint-ui/tools

A collection of development utilities and helper functions for the Tint UI library. This package provides modular tools that can be imported individually to keep your bundle size minimal.

## Installation

```bash
npm install @tint-ui/tools
```

## Usage

Import only the specific utilities you need:

```typescript
import { isPlainObject } from "@tint-ui/tools/is-plain-object";
import { logger } from "@tint-ui/tools/logger";
```

## Available Utilities

### @tint-ui/tools/as-props

Utility for handling polymorphic "as" prop pattern in React components.

- `asProps(props, options?)` - Processes component props to handle the 'as' prop pattern for polymorphic components

Types:

- `AsPropsOptions` - Configuration options for component rendering

### @tint-ui/tools/browser-support

Utilities for checking browser environment and features.

- `isBrowserEnvironment()` - Checks if the current environment is a browser
- `isLocalStorage()` - Checks if the localStorage is supported in the current environment

### @tint-ui/tools/class-group

Utility for generating BEM-style class names.

- `classGroup(name)` - Creates an object for generating class name strings with BEM-style naming conventions

Types:

- `ClassGroup` - Interface for class name generation with methods:
    - `base` - Returns the base class name
    - `a(name)` - Returns class name for child elements
    - `b(name, suffix?)` - Returns base class name with a modifier

### @tint-ui/tools/clone-plain-object

Utilities for deep cloning plain objects and arrays.

- `clonePlainObject(obj, options?)` - Creates a deep clone of a plain object

    - `obj` - The object to clone
    - `options` - Optional configuration
    - Handles primitive types, Date objects, BigInt values, Arrays and plain objects
    - Throws if input is not a plain object

- `clonePlainArray(arr, options?)` - Creates a deep clone of an array
    - `arr` - The array to clone
    - `options` - Same options as clonePlainObject
    - Throws if input is not an array

Types:

- `CloneObjectOptions` - Configuration options for cloning:
    - `unknown?: (object: unknown) => any` - Custom handler for unsupported types
    - `throwable?: boolean` - Whether to throw on unsupported types

### @tint-ui/tools/error-message

Utilities for handling and formatting error messages.

- `errorMessage(error, defaultMessage?)` - Converts any error type to a standardized error message format

Types:

- **ErrorMessage** - Standardized error message interface with `message` string

### @tint-ui/tools/is-empty

Utility for checking if a value is empty.

- `isEmpty(value)` - Checks if a value is empty (null, undefined, empty string, empty array, empty object)
- `isEmptyObject(value)` - Checks if a value is an empty object (null, undefined, or object with no properties)
- `isEmptyArray(value)` - Checks if a value is an empty array (null, undefined, or array with length 0)
- `isEmptyNumber(value)` - Checks if a value is an empty number (null, undefined, NaN, or non-finite number)
- `isEmptyString(value)` - Checks if a value is an empty string (null, undefined, or empty string "")

### @tint-ui/tools/is-plain-object

Utility for checking if a value is a plain JavaScript object.

- `isObject(value)` - Check if value is object (not null)
- `isPlainObject(value)` - Checks if value is a plain object (not null, not array, not date, etc.)

### @tint-ui/tools/logger

Logging utility with different severity levels.

- `Logger` - Logger class
- `logger` - Default logger instance
    - `logger.debug(message, ...args)` - Log debug messages
    - `logger.info(message, ...args)` - Log info messages
    - `logger.warn(message, ...args)` - Log warning messages
    - `logger.error(message, ...args)` - Log error messages

### @tint-ui/tools/to-case

String case manipulation utilities.

- `toCamel(str)` - Converts a string to CamelCase
- `toLowerCamel(str)` - Converts a string to lowerCamelCase
- `toKebab(str)` - Converts a string to kebab-case
- `toSnake(str)` - Converts a string to snake_case
- `toTitle(str)` - Converts a string to Title Case

### @tint-ui/tools/make-option

Utility for creating `InputSelectOption` objects, required for `@tint-ui/input-checkbox` and `@tint-ui/input-select` packages.

- `makeOption(item, dump)` - Creates an option for a select input

### @tint-ui/tools/merge-void-callback

Utility for merging multiple void callback functions into a single function. If one of the callbacks throws an error, subsequent callbacks will not be executed.

- `mergeVoidCallback(...callbacks)` - Merges multiple void callback functions into a single function that executes all callbacks in sequence. Safely handles null/undefined callbacks by skipping them.
- `mergeVoidCallbackAsync(...callbacks)` - Similar to `mergeVoidCallback`, but works with async functions.

### @tint-ui/tools/noop

Empty function that does nothing. Contains a single `noop` function that can be used as a placeholder or default callback.

- `noop()` - Empty function that does nothing and returns void

### @tint-ui/tools/proof

Utility for runtime type checking and warnings.

- `invariant(condition, message)` - Throws an error if condition is falsy
- `warning(condition, message)` - Logs a warning if condition is falsy
- `warningOnce(key, condition, message)` - Logs a warning once for a given key if condition is falsy
- `disableWarning()` - Disables all warnings

The warning functions check if a condition is null, false, or NaN/non-finite for numbers. The warning messages are logged using the logger utility and include stack traces in development for easier debugging.

### @tint-ui/tools/resize-element

Utility for observing element size changes using ResizeObserver.

- `resizeElement(element, callback, options)` - Observes size changes of a DOM element and calls the callback with new dimensions
    - `element` - DOM element to observe
    - `callback` - Function called with new width/height when element resizes
    - `options` - The options for the resizeElement function.
    - Returns a cleanup function to stop observing

### @tint-ui/tools/resize-page

Utility for observing page resize events.

- `resizePage(callback, initialEmit, delay)` - Adds a listener to the page resize event
    - `callback` - Function called when page resizes
    - `initialEmit` - Whether to execute callback immediately (default: false)
    - `delay` - Debounce delay in milliseconds (default: 200)
    - Returns a cleanup function to remove the listener

### @tint-ui/tools/scroll-page

Utility for observing page scroll events.

- `scrollPage(callback, initialEmit)` - Adds a listener to the page scroll event
    - `callback` - Function called when page scrolls
    - `initialEmit` - Whether to execute callback immediately (default: false)
    - Returns a cleanup function to remove the listener

### @tint-ui/tools/use-fork-ref

React hook for combining multiple refs into a single ref. Useful when you need to pass multiple refs to a component.

- `useForkRef(...refs)` - Combines multiple refs into a single ref callback
    - `refs` - Array of refs to combine (RefObject or callback refs)
    - Returns a single callback ref that updates all provided refs
- `setRef(ref, value)` - Helper function used internally to set a ref value
    - `ref` - The ref to update (can be callback ref or RefObject)
    - `value` - The value to set the ref to

Note: This is a React hook and should be used according to the [Rules of Hooks](https://reactjs.org/docs/hooks-rules.html).

### @tint-ui/tools/use-local-storage-state

React hook for persisting state in localStorage. Works similarly to React.useState but automatically saves/loads the state value to/from localStorage.

- `useLocalStorageState(key, initialValue)` - Creates state that persists in localStorage
    - `key` - Unique localStorage key to store the value under
    - `initialValue` - Initial state value if nothing exists in localStorage
    - Returns [value, setValue] tuple like useState

Key differences from `React.useState`:

- State persists across page refreshes by saving to localStorage
- Initial load checks localStorage first before using initialValue
- State updates are automatically synced to localStorage
- Changes in other tabs/windows trigger state updates
- Supports serializable values (objects, arrays etc) through JSON parsing

**Important note** about server-side rendering (SSR):\
Since this hook reads from `localStorage` which is only available in the browser, the initial value during server-side rendering will always be the default value, potentially causing hydration mismatches. To handle this:

1. Either use this hook only in client-side components
2. Or use it together with `useAppMount` hook and render component content only after mounting

Note: This is a React hook and should be used according to the [Rules of Hooks](https://reactjs.org/docs/hooks-rules.html).

### @tint-ui/tools/use-media-query

React hook for detecting if a media query matches. Useful for responsive behavior based on screen size or other media features.

- `useMediaQuery(query, options?)` - Returns whether the media query currently matches
    - `query` - Media query string to check (e.g. '(min-width: 768px)')
    - `options` - Optional options object:
        - `defaultMatches` - Initial match state before browser check (default: false)
        - `noSsr` - Skip SSR handling if true (default: false)
    - Returns boolean indicating if query matches
    - Re-renders component when match state changes

Key features:

- Automatically handles adding/removing media query listeners
- Updates in real-time as viewport/media changes
- Works with any valid media query string
- Cleans up listeners when component unmounts

Note: This is a React hook and should be used according to the [Rules of Hooks](https://reactjs.org/docs/hooks-rules.html).

### @tint-ui/tools/use-mount

React hook for checking if the component is mounted. Useful for handling browser-only code and avoiding state updates on unmounted components.

If you are using the tint-ui ecosystem, consider using the `useAppMount` hook instead - its initial state will be true if the component is already mounted, avoiding hydration conflicts after SSR.

- `useMount()` - Returns whether component is currently mounted
    - Returns boolean indicating mount status
    - Value is `false` during initial render
    - Changes to `true` after component mounts

Note: This is a React hook and should be used according to the [Rules of Hooks](https://reactjs.org/docs/hooks-rules.html).

## License

MIT
