# @tint-ui/button

A flexible and customizable button component library for React applications, built with TypeScript and Tailwind CSS. This package provides two main components: `Button` for standard button functionality and `ButtonTrigger` for event-triggered actions.

## Installation

> We recommend installing the component using the `tint-ui add` command to add all necessary dependencies. However, you can also install the component manually:

```bash
npm install @tint-ui/button
```

## Usage

```tsx
import { Button, ButtonTrigger } from "@tint-ui/button";

// Basic button
<Button>Click me</Button>

// Button with trigger
<ButtonTrigger trigger={{ name: "toast", props: { message: "Hello!" } }}>
  Show Toast
</ButtonTrigger>
```

## Components

### Button

The `Button` component is a versatile button element that supports various styles, sizes, and states.

#### Props

| Prop        | Type            | Default     | Description                                                                                           |
| ----------- | --------------- | ----------- | ----------------------------------------------------------------------------------------------------- |
| `size`      | `ButtonSize`    | `"md"`      | Button size. Available options: `"sm"`, `"md"`, `"lg"`, `"xs"`                                        |
| `variant`   | `ButtonVariant` | `"primary"` | Button style variant. Available options: `"primary"`, `"secondary"`, `"outline"`, `"ghost"`, `"link"` |
| `iconOnly`  | `boolean`       | `false`     | If true, button will be rendered as a square icon button                                              |
| `full`      | `boolean`       | `false`     | If true, button will take full width of its container                                                 |
| `iconLeft`  | `ReactNode`     | -           | Icon to display on the left side of the button text                                                   |
| `iconRight` | `ReactNode`     | -           | Icon to display on the right side of the button text                                                  |
| `loading`   | `boolean`       | `false`     | If true, button will show a loading spinner and be disabled                                           |
| `rounded`   | `boolean`       | `false`     | If true, button will have fully rounded corners                                                       |

#### Examples

```tsx
// Basic button
<Button>Click me</Button>

// Button with icons
<Button
  iconLeft={<IconComponent />}
  iconRight={<IconComponent />}
>
  With Icons
</Button>

// Loading button
<Button loading>Loading...</Button>

// Icon only button
<Button iconOnly iconLeft={<IconComponent />} />

// Full width button
<Button full>Full Width</Button>

// Different variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

// Different sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>
```

### ButtonTrigger

The `ButtonTrigger` component extends the base `Button` component with trigger functionality, allowing you to easily create buttons that trigger various system events like toasts, dialogs, or custom actions.

#### Props

| Prop               | Type          | Default | Description                                                          |
|--------------------|---------------|---------|----------------------------------------------------------------------|
| `trigger`          | `TriggerProp` | -       | Trigger configuration object that defines the action to be performed |
| `defaultPrevented` | `boolean`     | `false` | If true, prevents the default button click behavior                  |
| `confirmation`     | `string`      | -       | Optional confirmation message to show before triggering the action   |

#### Trigger Types

The `trigger` prop accepts various types of triggers:

```typescript
type TriggerProp<P extends object> = string | [string, P] | { name: string; props: P };
```

#### Examples

```tsx
// Toast trigger
<ButtonTrigger
  trigger={["toast", {
    message: "Operation successful!"
  }]}
>
  Show Toast
</ButtonTrigger>

// Dialog trigger with confirmation
<ButtonTrigger
  trigger={{
    name: "dialog:alert",
    props: {
        message: "Hello, world",
    },
  }}
>
  Open Dialog
</ButtonTrigger>

// Custom trigger
<ButtonTrigger
  trigger={{
    name: "custom",
    props: {
        action: () => console.log("Custom action")
    }
  }}
  confirmation="Are you sure you want to proceed?"
>
  Custom Action
</ButtonTrigger>
```

## TypeScript Support

The package includes full TypeScript support with comprehensive type definitions for all props and components.

## License

MIT
