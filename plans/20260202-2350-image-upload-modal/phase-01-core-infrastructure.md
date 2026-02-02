# Phase 1: Core Infrastructure

## Context

| Field | Value |
|-------|-------|
| **Parent Plan** | [plan.md](plan.md) |
| **Dependencies** | None |
| **Docs** | [codebase-summary](../../docs/codebase-summary.md), [code-standards](../../docs/code-standards.md) |

## Overview

| Field | Value |
|-------|-------|
| **Date** | 2026-02-02 |
| **Description** | Set up image processing utilities and modal component structure |
| **Priority** | High |
| **Implementation Status** | Not Started |
| **Review Status** | Pending |

## Key Insights

1. Current Editor uses dynamic import for MDEditor (SSR: false)
2. Existing modal pattern in SettingsModal.tsx can be reused
3. Need utility functions for canvas-based image operations
4. react-easy-crop requires wrapper component

## Requirements

- Install react-easy-crop dependency
- Create image utility functions (crop, resize, base64 conversion)
- Create base ImageUploadModal component structure
- Create UploadZone component for drag-drop

## Related Code Files

| File | Purpose | Action |
|------|---------|--------|
| `components/editor/Editor.tsx` | Main editor | Modify |
| `components/editor/ImageUploadModal.tsx` | New modal | Create |
| `components/editor/UploadZone.tsx` | Upload UI | Create |
| `lib/utils/image-utils.ts` | Image processing | Create |

## Implementation Steps

### Step 1.1: Install Dependencies
```bash
pnpm add react-easy-crop
```

### Step 1.2: Create Image Utilities
Create `lib/utils/image-utils.ts`:

```typescript
// Create image from URL/file
export function createImage(url: string): Promise<HTMLImageElement>;

// Get cropped image as base64
export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: CropArea,
  maxWidth?: number,
  quality?: number
): Promise<string>;

// Read file as data URL
export function readFileAsDataURL(file: File): Promise<string>;

// Validate image file
export function validateImageFile(file: File): { valid: boolean; error?: string };
```

### Step 1.3: Create UploadZone Component
Create `components/editor/UploadZone.tsx`:

- Drag-drop zone with dashed border
- Visual feedback on dragover
- File input fallback
- File validation (type, size)
- Callback with image data URL

### Step 1.4: Create Modal Shell
Create `components/editor/ImageUploadModal.tsx`:

- Modal overlay with backdrop blur
- Header with title and close button
- Step indicator (Upload → Edit → Insert)
- Keyboard handling (ESC to close)
- Focus trap

## Todo List

- [ ] Install react-easy-crop
- [ ] Create lib/utils/image-utils.ts
- [ ] Create UploadZone component
- [ ] Create ImageUploadModal shell
- [ ] Add types for image processing

## Success Criteria

- [ ] Dependencies installed without errors
- [ ] Image utilities work in isolation
- [ ] UploadZone handles drag-drop correctly
- [ ] Modal opens/closes properly
- [ ] TypeScript compiles without errors

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| react-easy-crop SSR issues | Medium | Use dynamic import like MDEditor |
| Large image memory issues | Low | Add file size validation (5MB max) |

## Security Considerations

- Validate file MIME type (not just extension)
- Limit max file size to prevent memory issues
- Sanitize alt text input

## Next Steps

After Phase 1:
→ Proceed to [Phase 2: Image Editor UI](phase-02-image-editor-ui.md)
