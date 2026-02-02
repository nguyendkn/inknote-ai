# Research: UI/UX for Executable Code Blocks

## Overview
Phân tích UI/UX patterns từ Jupyter, VS Code, Observable cho executable code blocks.

## 1. Reference Implementations

### Jupyter Notebooks
- Play button góc trái cell
- Cell number indicator [1]
- Output hiển thị ngay dưới cell
- Clear output option
- Interrupt kernel button khi running

### VS Code Notebooks
- Run button inline với cell
- Running indicator (spinner)
- Output inline hoặc collapsible
- Error highlighting đỏ
- Success checkmark

### Observable
- Shift+Enter to run
- Inline output
- Live preview

## 2. UI Design Recommendations (ui-ux-pro-max)

### Play Button Design
```
Position: Top-right của code block
Size: 32x32px (touch-friendly)
States:
- Default: Play icon, subtle gray
- Hover: Highlight, scale 1.05
- Running: Spinner animation
- Disabled: 50% opacity
```

### Color Palette (matching InkNote)
```css
--run-button-bg: rgba(59, 130, 246, 0.1);
--run-button-hover: rgba(59, 130, 246, 0.2);
--run-button-active: #3B82F6;
--output-success-bg: rgba(34, 197, 94, 0.05);
--output-error-bg: rgba(239, 68, 68, 0.05);
--output-border: #e2e8f0;
```

### Code Block Container Structure
```
┌─────────────────────────────────────────────┐
│ bash                              [▶ Run]   │
├─────────────────────────────────────────────┤
│ $ npm install                               │
│ $ npm run build                             │
└─────────────────────────────────────────────┘
     ↓ (when executed)
┌─────────────────────────────────────────────┐
│ Output                    [Copy] [Clear] [×]│
├─────────────────────────────────────────────┤
│ added 150 packages in 2s                    │
│ ✓ Build completed                           │
└─────────────────────────────────────────────┘
```

## 3. States & Animations

### Button States
1. **Idle**: `opacity: 0.7`, show on hover code block
2. **Hover**: `opacity: 1`, `scale: 1.05`
3. **Running**: Spinner, pulse animation
4. **Success**: Checkmark flash, then reset
5. **Error**: Red tint, shake animation

### Output Panel Animations
```css
/* Slide down entrance */
@keyframes slideDown {
  from { height: 0; opacity: 0; }
  to { height: auto; opacity: 1; }
}

/* Output streaming effect */
@keyframes typewriter {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

## 4. Output Display Patterns

### Inline Output (Recommended)
- Hiển thị ngay dưới code block
- Max height 300px, scrollable
- Monospace font
- Syntax highlighting cho errors

### Output Toolbar
- Copy button: Copy all output
- Clear button: Clear output
- Expand/Collapse toggle
- Close button

### Error Display
- Red left border
- Error icon
- Stderr in red/orange
- Exit code badge

## 5. Confirmation Dialog Design

### For Dangerous Commands
```
┌─────────────────────────────────────────────┐
│ ⚠️ Warning                           [×]   │
├─────────────────────────────────────────────┤
│ This command may be destructive:            │
│                                             │
│   rm -rf ./node_modules                     │
│                                             │
│ Are you sure you want to execute it?        │
│                                             │
│              [Cancel]  [Run Anyway]         │
└─────────────────────────────────────────────┘
```

## 6. Responsive Considerations

### Mobile
- Button vẫn tap-friendly (min 44x44)
- Output full-width
- Horizontal scroll cho long output

### Desktop
- Hover states active
- Keyboard shortcuts (Ctrl+Enter)

## 7. Accessibility

- ARIA labels cho buttons
- Focus indicators
- Screen reader announcements
- Keyboard navigation

## Key UI/UX Principles

1. **Discoverability**: Button visible on hover
2. **Feedback**: Clear running/success/error states
3. **Control**: Cancel, clear, copy actions
4. **Safety**: Confirmation cho dangerous commands
5. **Consistency**: Match existing InkNote design

## Citations

- Jupyter UI: https://jupyter.org
- VS Code Notebooks: https://code.visualstudio.com/docs/datascience/jupyter-notebooks
- Material Design Motion: https://m3.material.io/styles/motion
