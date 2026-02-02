# Phase 3: Editor Integration

## Context

- **Parent Plan**: [plan.md](./plan.md)
- **Dependencies**: [Phase 2: UI Components](./phase-02-ui-components.md)
- **Documentation**: [@uiw/react-md-editor docs](https://uiwjs.github.io/react-md-editor/)

## Overview

| Field | Value |
|-------|-------|
| **Date** | 2026-02-03 |
| **Description** | Integrate ExecutableCodeBlock vào MDEditor preview renderer |
| **Priority** | High |
| **Implementation Status** | ⏳ Pending |
| **Review Status** | ⏳ Pending |

## Key Insights

1. @uiw/react-md-editor sử dụng `rehype-prism` cho syntax highlighting
2. Có thể custom code block render qua `components` prop của preview
3. Cần detect language="bash" hoặc "shell" để show run button

## Requirements

- Custom code block renderer cho bash/shell
- Preserve existing syntax highlighting
- Seamless integration, không break existing functionality
- Performance: chỉ wrap bash blocks, không affect others

## Architecture

```
MDEditor
└── Preview
    └── rehype plugins
        └── Custom code renderer
            ├── language === 'bash' | 'shell'
            │   └── ExecutableCodeBlock
            └── other languages
                └── Default <pre><code> render
```

## Related Code Files

| File | Purpose |
|------|---------|
| [components/editor/Editor.tsx](../../components/editor/Editor.tsx) | Modify preview renderer |
| [components/editor/ExecutableCodeBlock.tsx](../../components/editor/ExecutableCodeBlock.tsx) | Use in renderer |
| `components/editor/CodeBlockRenderer.tsx` | **NEW** - Custom code renderer |

## Implementation Steps

### Step 1: Create CodeBlockRenderer
```tsx
// components/editor/CodeBlockRenderer.tsx
import { ExecutableCodeBlock } from './ExecutableCodeBlock';

interface CodeProps {
  children?: React.ReactNode;
  className?: string;
  node?: unknown;
}

export function CodeBlockRenderer({ children, className, ...props }: CodeProps) {
  // Extract language from className (e.g., "language-bash")
  const match = /language-(\w+)/.exec(className || '');
  const language = match?.[1];
  const code = String(children).replace(/\n$/, '');

  // Check if executable
  const isExecutable = language === 'bash' || language === 'shell' || language === 'sh';

  if (isExecutable) {
    return (
      <ExecutableCodeBlock
        code={code}
        language={language}
        className={className}
        {...props}
      />
    );
  }

  // Default code block rendering
  return (
    <code className={className} {...props}>
      {children}
    </code>
  );
}
```

### Step 2: Modify Editor.tsx
```tsx
// In Editor.tsx
import { CodeBlockRenderer } from './CodeBlockRenderer';

// Add to MDEditor
<MDEditor
  // ... existing props
  previewOptions={{
    components: {
      code: CodeBlockRenderer,
    },
  }}
/>
```

### Step 3: Handle Pre Wrapper
Need to also handle the `<pre>` wrapper for code blocks:
```tsx
export function PreBlockRenderer({ children, ...props }) {
  // If child is ExecutableCodeBlock, render differently
  // Otherwise standard pre
}
```

### Step 4: Test Edge Cases
- Inline code (`backtick`) vs code blocks
- Nested code in lists
- Multiple bash blocks in one note
- Copy/paste code blocks

## Todo List

- [ ] Tạo `components/editor/CodeBlockRenderer.tsx`
- [ ] Tạo `components/editor/PreBlockRenderer.tsx` (nếu cần)
- [ ] Modify Editor.tsx để use custom renderers
- [ ] Test với các edge cases
- [ ] Ensure syntax highlighting preserved

## Success Criteria

- [ ] Bash code blocks show RunButton
- [ ] Other languages render normally
- [ ] Inline code không affected
- [ ] Syntax highlighting works
- [ ] Multiple blocks work independently
- [ ] Edit mode không break

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Break existing code blocks | Thorough testing, fallback to default |
| Performance with many blocks | Lazy render, virtualization |
| SSR issues | Dynamic import ExecutableCodeBlock |

## Security Considerations

- Code content display chỉ là text, không execute until user clicks

## Next Steps

After completion, proceed to [Phase 4: Security & Polish](./phase-04-security-polish.md)
