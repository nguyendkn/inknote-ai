# Workspace Configuration Feature Plan

**Created**: 2026-02-03
**Status**: In Progress
**Priority**: High

## Overview

Thêm tính năng cấu hình workspace location vào ứng dụng Electron Markitdown, cho phép user chọn thư mục lưu trữ notes và hiển thị cây thư mục. Cấu hình được lưu vào file `configs.ini` cùng vị trí với ứng dụng.

## Objectives

1. Cho phép user chọn workspace directory qua Settings Modal
2. Hiển thị cây thư mục của workspace đã chọn
3. Lưu cấu hình vào file configs.ini (INI format)
4. Tích hợp workspace path vào hệ thống file management

## Implementation Phases

| Phase | Name | Status | Description |
|-------|------|--------|-------------|
| 01 | [Config Service](phase-01-config-service.md) | Completed | Tạo config service để đọc/ghi file configs.ini |
| 02 | [Electron IPC](phase-02-electron-ipc.md) | Completed | Thêm IPC handlers cho folder picker và config |
| 03 | [UI Components](phase-03-ui-components.md) | Completed | Cập nhật WorkspaceTab với folder picker và tree view |
| 04 | [Integration](phase-04-integration.md) | Pending | Tích hợp workspace path vào file operations |

## Technical Stack

- **Config Format**: INI file (dễ đọc, native support)
- **Config Location**: `app.getPath('exe')` directory
- **IPC**: Electron IPC main ↔ renderer
- **UI**: React components với Tailwind CSS

## Key Files

- `electron/main.ts` - IPC handlers
- `electron/preload.ts` - Context bridge APIs
- `components/settings/tabs/WorkspaceTab.tsx` - UI
- `lib/services/config-service.ts` - Config logic (new)

## Dependencies

- Node.js `fs` module (INI parsing)
- Electron `dialog` API (folder picker)
- Electron `app.getPath()` (config location)

## Risks

1. **Permission errors**: User có thể chọn folder không có quyền ghi
2. **Path differences**: Windows/Mac/Linux path formats khác nhau
3. **First-time setup**: Cần default workspace khi chưa có config

---

*Last Updated: 2026-02-03*
