export type UpdateStatus =
  | "idle"
  | "checking"
  | "available"
  | "not-available"
  | "downloading"
  | "ready"
  | "error";

export interface UpdateState {
  status: UpdateStatus;
  info?: {
    version: string;
    releaseNotes?: string;
  };
  error?: string;
  progress?: {
    percent: number;
    bytesPerSecond: number;
    transferred: number;
    total: number;
  };
}

export interface ElectronAPI {
  platform: NodeJS.Platform;
  getAppVersion: () => Promise<string>;

  devices: {
    list: () => Promise<Device[]>;
    refresh: () => Promise<Device[]>;
    onChanged: (callback: (devices: Device[]) => void) => () => void;
  };

  settings: {
    getEnvironment: () => Promise<EmulatorEnvironment>;
    setAdbPath: (path: string) => Promise<boolean>;
    setProfileStoragePath: (path: string) => Promise<boolean>;
    getEmulatorConfigs: () => Promise<EmulatorConfig[]>;
    updateEmulatorConfig: (
      type: EmulatorConfig["type"],
      update: Partial<EmulatorConfig>,
    ) => Promise<boolean>;
    validateEmulatorPath: (installPath: string) => Promise<{
      valid: boolean;
      adbPath: string | null;
      error: string | null;
      suggestion?: string;
    }>;
  };

  system: {
    getInfo: () => Promise<{
      cpu: { usage: number; cores: number };
      memory: { usage: number; total: number; used: number };
    }>;
  };

  updater: {
    check: () => Promise<UpdateState>;
    install: () => Promise<void>;
    getStatus: () => Promise<UpdateState>;
    onStatus: (callback: (state: UpdateState) => void) => () => void;
  };
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export {};
