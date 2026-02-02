# Research: @uiw/react-md-editor Custom Commands API

## Overview
Research on how to customize toolbar commands in @uiw/react-md-editor for InkNote AI image upload feature.

## Key Findings

### 1. Custom Command Structure
```typescript
import { commands, ICommand } from '@uiw/react-md-editor';

interface ICommand {
  name: string;           // Command identifier
  keyCommand: string;     // Keyboard shortcut key
  shortcuts?: string;     // Keyboard shortcut display
  icon?: React.ReactNode; // Button icon
  execute?: (state: TextState, api: TextAreaTextApi) => void;
}
```

### 2. Override Default Image Command
```typescript
import MDEditor, { commands } from '@uiw/react-md-editor';

const customImageCommand: ICommand = {
  ...commands.image,
  execute: (state, api) => {
    // Custom logic - open modal instead of default
    setShowImageModal(true);
    // Store api reference for later use
    editorApiRef.current = api;
  },
};

<MDEditor
  commands={[
    commands.bold,
    commands.italic,
    customImageCommand, // Override image
    // ... other commands
  ]}
/>
```

### 3. TextAreaTextApi Methods
```typescript
interface TextAreaTextApi {
  replaceSelection(text: string): void;  // Replace selected text
  setSelectionRange(range): void;        // Set cursor position
  getState(): TextState;                 // Get current state
}

// Insert markdown image at cursor
api.replaceSelection(`![${altText}](${base64Data})`);
```

### 4. Complete Custom Commands Array
```typescript
import { commands, getCommands } from '@uiw/react-md-editor';

// Get all default commands
const defaultCommands = getCommands();

// Replace image command
const customCommands = defaultCommands.map(cmd =>
  cmd.name === 'image' ? customImageCommand : cmd
);
```

### 5. Command Groups (Toolbar Layout)
```typescript
<MDEditor
  commands={[
    commands.group([commands.bold, commands.italic], { /* options */ }),
    commands.divider,
    customImageCommand,
  ]}
/>
```

## Implementation Notes

1. **Store API Reference**: Use `useRef` to store TextAreaTextApi for async operations
2. **Dynamic Import**: MDEditor already uses dynamic import (SSR: false)
3. **Command Replacement**: Can replace single command or entire commands array

## Sources
- GitHub: https://github.com/uiwjs/react-md-editor
- npm: @uiw/react-md-editor v4.0.11

## Unresolved Questions
- None - API is well documented
