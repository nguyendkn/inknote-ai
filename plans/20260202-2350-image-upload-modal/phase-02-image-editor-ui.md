# Phase 2: Image Editor UI

## Context

| Field | Value |
|-------|-------|
| **Parent Plan** | [plan.md](plan.md) |
| **Dependencies** | [Phase 1](phase-01-core-infrastructure.md) |
| **Docs** | [code-standards](../../docs/code-standards.md) |

## Overview

| Field | Value |
|-------|-------|
| **Date** | 2026-02-02 |
| **Description** | Build crop interface, resize controls, and preview functionality |
| **Priority** | High |
| **Implementation Status** | Not Started |
| **Review Status** | Pending |

## Key Insights

1. react-easy-crop provides zoom/pan interface
2. Resize controls need aspect ratio lock toggle
3. Preview should update in real-time
4. Match existing UI patterns (Tailwind, rounded corners, shadows)

## Requirements

- Integrate react-easy-crop into modal
- Build resize controls (width, height, aspect lock)
- Add preview pane showing final result
- Implement step navigation (Upload → Crop → Preview)
- Match existing InkNote AI design patterns

## Architecture

```
ImageUploadModal
├── Step 1: UploadZone
│   └── Drag-drop or file picker
├── Step 2: ImageEditor
│   ├── Cropper (react-easy-crop)
│   ├── ZoomSlider
│   └── ResizeControls
│       ├── WidthInput
│       ├── HeightInput
│       ├── AspectLockToggle
│       └── PresetButtons (optional)
└── Step 3: Preview
    ├── PreviewImage
    ├── AltTextInput
    └── FileSizeDisplay
```

## Related Code Files

| File | Purpose | Action |
|------|---------|--------|
| `components/editor/ImageUploadModal.tsx` | Main modal | Modify |
| `components/editor/ImageCropper.tsx` | Crop wrapper | Create |
| `components/editor/ResizeControls.tsx` | Size controls | Create |
| `components/editor/ImagePreview.tsx` | Final preview | Create |

## Implementation Steps

### Step 2.1: Create ImageCropper Component
```typescript
// components/editor/ImageCropper.tsx
import Cropper from 'react-easy-crop';

interface ImageCropperProps {
  imageSrc: string;
  onCropComplete: (croppedAreaPixels: CropArea) => void;
}
```

Features:
- Wrap react-easy-crop with dynamic import
- Zoom slider control
- Aspect ratio selector (free, 16:9, 4:3, 1:1)
- Touch-friendly controls

### Step 2.2: Create ResizeControls Component
```typescript
// components/editor/ResizeControls.tsx
interface ResizeControlsProps {
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
  lockAspect: boolean;
  onWidthChange: (w: number) => void;
  onHeightChange: (h: number) => void;
  onLockChange: (locked: boolean) => void;
}
```

Features:
- Width/height number inputs
- Lock aspect ratio toggle (Lock icon from Lucide)
- Reset to original button
- Max width limit input (for markdown display)

### Step 2.3: Create ImagePreview Component
```typescript
// components/editor/ImagePreview.tsx
interface ImagePreviewProps {
  base64Src: string;
  altText: string;
  onAltTextChange: (alt: string) => void;
}
```

Features:
- Preview cropped/resized image
- Alt text input field
- Display estimated file size
- Show markdown preview

### Step 2.4: Build Modal Flow
Update ImageUploadModal with step management:

```typescript
type ModalStep = 'upload' | 'edit' | 'preview';
const [step, setStep] = useState<ModalStep>('upload');
```

Navigation:
- Upload → Edit (on image selected)
- Edit → Preview (on "Next" click)
- Preview → Insert (on "Insert" click)
- Back buttons between steps

## UI/UX Design

### Color Scheme (Light Theme)
- Background: `bg-white`
- Border: `border-slate-200`
- Primary button: `bg-linear-to-r from-purple-500 to-blue-500`
- Secondary button: `bg-slate-100 hover:bg-slate-200`

### Dimensions
- Modal width: `max-w-2xl` (672px)
- Cropper height: `h-80` (320px)
- Border radius: `rounded-2xl`

### Accessibility
- Focus visible rings
- Keyboard navigation
- Screen reader labels

## Todo List

- [ ] Create ImageCropper with dynamic import
- [ ] Create ResizeControls with aspect lock
- [ ] Create ImagePreview component
- [ ] Implement step navigation in modal
- [ ] Add zoom slider
- [ ] Add aspect ratio presets
- [ ] Style to match InkNote design
- [ ] Test on mobile viewport

## Success Criteria

- [ ] Cropper shows and allows zoom/pan
- [ ] Resize controls work with aspect lock
- [ ] Preview shows accurate final result
- [ ] Step navigation is intuitive
- [ ] UI matches existing design patterns
- [ ] Works on mobile devices

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Cropper performance on large images | Medium | Limit preview resolution |
| Complex state management | Low | Use single state object |

## Security Considerations

- Sanitize alt text (no script injection)
- Validate numeric inputs for resize

## Next Steps

After Phase 2:
→ Proceed to [Phase 3: MDEditor Integration](phase-03-mdeditor-integration.md)
