# Implementation Plan: Image Upload Modal

## Overview

| Field | Value |
|-------|-------|
| **Feature** | Image Upload Modal with Crop/Resize |
| **Date** | 2026-02-02 |
| **Status** | Completed |
| **Priority** | High |
| **Estimated Phases** | 3 |

## Summary

Add image upload functionality to InkNote AI's Markdown editor. When user clicks the Image toolbar button, a modal opens allowing them to upload, resize, and crop an image before inserting it as base64 into the markdown content.

## Phases

| Phase | Name | Status | Progress |
|-------|------|--------|----------|
| 1 | [Core Infrastructure](phase-01-core-infrastructure.md) | Completed | 100% |
| 2 | [Image Editor UI](phase-02-image-editor-ui.md) | Completed | 100% |
| 3 | [MDEditor Integration](phase-03-mdeditor-integration.md) | Completed | 100% |

## Architecture Overview

```
Editor.tsx
├── MDEditor (with custom image command)
├── ImageUploadModal (new)
│   ├── UploadZone (drag-drop + file picker)
│   ├── ImageCropper (react-easy-crop)
│   ├── ResizeControls (width/height/aspect lock)
│   └── ActionButtons (cancel/insert)
└── lib/utils/image-utils.ts (crop, resize, base64)
```

## Key Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| Crop Library | react-easy-crop | Small bundle (~10KB), good UX, touch support |
| Image Storage | Base64 inline | No external hosting needed, works offline |
| Max File Size | 5MB | Reasonable for base64 embedding |
| Default Format | JPEG 85% | Good balance of quality/size |

## Dependencies to Add

```bash
pnpm add react-easy-crop
```

## Success Criteria

- [x] Image toolbar button opens custom modal
- [x] Drag-drop and file picker work
- [x] Crop interface with visual preview
- [x] Resize with aspect ratio lock
- [x] Base64 inserted correctly into markdown
- [x] Mobile responsive
- [x] Accessible (keyboard nav, focus trap, ESC close)

## Research References

- [MDEditor API Research](research/researcher-01-mdeditor-api.md)
- [Image Libraries Research](research/researcher-02-image-libraries.md)

---

*Created: 2026-02-02*
