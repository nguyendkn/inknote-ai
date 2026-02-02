# Phase 01: Config Service

## Context Links
- **Parent Plan**: [plan.md](plan.md)
- **Dependencies**: None
- **Next Phase**: [phase-02-electron-ipc.md](phase-02-electron-ipc.md)

## Overview

| Field | Value |
|-------|-------|
| Date | 2026-02-03 |
| Description | Tạo config service để đọc/ghi file configs.ini |
| Priority | High |
| Implementation Status | Pending |
| Review Status | Pending |

## Key Insights

1. Electron app có thể lấy đường dẫn exe qua `app.getPath('exe')`
2. INI format đơn giản, dễ đọc và parse
3. Cần handle trường hợp file chưa tồn tại (first-time setup)
4. Config phải được load khi app khởi động

## Requirements

### Functional
- Đọc file configs.ini từ thư mục chứa app
- Ghi/cập nhật file configs.ini
- Parse INI format với sections: [workspace], [general]
- Cung cấp default values khi file không tồn tại

### Non-Functional
- Xử lý lỗi: file không đọc được, permission denied
- Cross-platform path handling
- Atomic writes để tránh data corruption

## Architecture

```
┌─────────────────────────────────────────┐
│           Config Service                 │
├─────────────────────────────────────────┤
│  getConfigPath(): string                │
│  readConfig(): AppConfig                │
│  writeConfig(config: AppConfig): void   │
│  getWorkspacePath(): string             │
│  setWorkspacePath(path: string): void   │
└─────────────────────────────────────────┘
```

### Config File Format (configs.ini)

```ini
[workspace]
path=D:\Documents\MyNotes
defaultNotebook=inbox

[general]
theme=light
language=en
```

### TypeScript Interface

```typescript
interface AppConfig {
  workspace: {
    path: string;
    defaultNotebook: string;
  };
  general: {
    theme: 'light' | 'dark' | 'system';
    language: string;
  };
}
```

## Related Code Files

| File | Action | Description |
|------|--------|-------------|
| `lib/services/config-service.ts` | Create | Config service implementation |
| `electron/main.ts` | Modify | Import và sử dụng config service |
| `types/config.ts` | Create | TypeScript interfaces cho config |

## Implementation Steps

### Step 1: Create Type Definitions
```typescript
// types/config.ts
export interface WorkspaceConfig {
  path: string;
  defaultNotebook: string;
}

export interface GeneralConfig {
  theme: 'light' | 'dark' | 'system';
  language: string;
}

export interface AppConfig {
  workspace: WorkspaceConfig;
  general: GeneralConfig;
}
```

### Step 2: Create Config Service
```typescript
// lib/services/config-service.ts
import fs from 'fs';
import path from 'path';
import { app } from 'electron';
import { AppConfig } from '@/types/config';

const DEFAULT_CONFIG: AppConfig = {
  workspace: {
    path: '',
    defaultNotebook: 'inbox',
  },
  general: {
    theme: 'system',
    language: 'en',
  },
};

export class ConfigService {
  private configPath: string;
  private config: AppConfig;

  constructor() {
    // Get directory containing the executable
    const exePath = app.getPath('exe');
    const exeDir = path.dirname(exePath);
    this.configPath = path.join(exeDir, 'configs.ini');
    this.config = this.loadConfig();
  }

  private loadConfig(): AppConfig {
    try {
      if (!fs.existsSync(this.configPath)) {
        this.saveConfig(DEFAULT_CONFIG);
        return DEFAULT_CONFIG;
      }
      const content = fs.readFileSync(this.configPath, 'utf-8');
      return this.parseIni(content);
    } catch (error) {
      console.error('Failed to load config:', error);
      return DEFAULT_CONFIG;
    }
  }

  private parseIni(content: string): AppConfig {
    // Parse INI format into AppConfig
    // ...implementation
  }

  private stringifyIni(config: AppConfig): string {
    // Convert AppConfig to INI string
    // ...implementation
  }

  saveConfig(config: AppConfig): void {
    const content = this.stringifyIni(config);
    fs.writeFileSync(this.configPath, content, 'utf-8');
    this.config = config;
  }

  getConfig(): AppConfig {
    return this.config;
  }

  getWorkspacePath(): string {
    return this.config.workspace.path;
  }

  setWorkspacePath(workspacePath: string): void {
    this.config.workspace.path = workspacePath;
    this.saveConfig(this.config);
  }
}
```

### Step 3: INI Parser Implementation
- Parse sections: `[section_name]`
- Parse key-value: `key=value`
- Handle empty lines and comments (`;` or `#`)

### Step 4: Export Singleton Instance
```typescript
export const configService = new ConfigService();
```

## Todo List

- [ ] Create `types/config.ts` with AppConfig interface
- [ ] Create `lib/services/config-service.ts`
- [ ] Implement INI parser (parseIni function)
- [ ] Implement INI stringify (stringifyIni function)
- [ ] Add error handling for file operations
- [ ] Add default workspace path (Documents folder)
- [ ] Test on Windows, Mac, Linux

## Success Criteria

1. ✅ Config file được tạo tại thư mục chứa exe
2. ✅ Đọc được config khi app khởi động
3. ✅ Ghi được config khi thay đổi settings
4. ✅ Default values hoạt động khi file không tồn tại
5. ✅ Cross-platform compatibility

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Permission denied khi ghi file | High | Catch error, notify user |
| Config file bị corrupt | Medium | Backup trước khi ghi, restore default |
| Path khác nhau giữa OS | Low | Sử dụng path.join() |

## Security Considerations

1. **No sensitive data**: Config chỉ chứa paths, không chứa credentials
2. **Validate paths**: Kiểm tra path hợp lệ trước khi lưu
3. **Sanitize input**: Không cho phép path traversal attacks

## Next Steps

→ Tiếp tục với [Phase 02: Electron IPC](phase-02-electron-ipc.md)

---

*Last Updated: 2026-02-03*
