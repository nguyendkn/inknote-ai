import type {
  Device,
  EmulatorConfig,
  EmulatorEnvironment,
  EmulatorType,
  Profile,
  ProfileCreateInput,
  ProfileType,
  ProfileUpdateInput,
} from "../shared/types";
import type { EmulatorInstance, InstanceStatus } from "./adapters/base/types";

interface ApiResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ElectronAPI {
  platform: NodeJS.Platform;
  getAppVersion: () => Promise<string>;

  devices: {
    list: () => Promise<Device[]>;
    refresh: () => Promise<Device[]>;
    onChanged: (callback: (devices: Device[]) => void) => () => void;
  };

  instances: {
    list: (platform?: EmulatorType) => Promise<ApiResult<EmulatorInstance[]>>;
    create: (
      platform: EmulatorType,
      name: string,
    ) => Promise<ApiResult<EmulatorInstance>>;
    clone: (
      platform: EmulatorType,
      sourceId: string,
      newName: string,
    ) => Promise<ApiResult<EmulatorInstance>>;
    delete: (platform: EmulatorType, instanceId: string) => Promise<ApiResult>;
    start: (platform: EmulatorType, instanceId: string) => Promise<ApiResult>;
    stop: (platform: EmulatorType, instanceId: string) => Promise<ApiResult>;
    status: (
      platform: EmulatorType,
      instanceId: string,
    ) => Promise<ApiResult<InstanceStatus>>;
    backup: (
      platform: EmulatorType,
      instanceId: string,
      targetPath: string,
    ) => Promise<ApiResult>;
    restore: (
      platform: EmulatorType,
      instanceId: string,
      sourcePath: string,
    ) => Promise<ApiResult>;
  };

  profiles: {
    list: (options?: {
      type?: ProfileType;
      tag?: string;
      search?: string;
      limit?: number;
      offset?: number;
    }) => Promise<Profile[]>;
    get: (id: string) => Promise<Profile | null>;
    create: (serial: string, input: ProfileCreateInput) => Promise<Profile>;
    update: (id: string, input: ProfileUpdateInput) => Promise<Profile | null>;
    rename: (id: string, name: string) => Promise<Profile | null>;
    delete: (id: string) => Promise<boolean>;
    deleteBulk: (ids: string[]) => Promise<number>;
    restore: (profileId: string, serial: string) => Promise<void>;
    getTags: () => Promise<string[]>;
    getCount: (type?: ProfileType) => Promise<number>;
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
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export {};
