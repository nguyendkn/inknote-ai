import fs from "fs";
import path from "path";
import { app } from "electron";
import { AppConfig, DEFAULT_CONFIG } from "../types/config";

/**
 * Service for reading/writing application configuration
 * Config is stored in configs.ini file next to the executable
 */
class ConfigService {
  private configPath: string | null = null;
  private config: AppConfig | null = null;
  private initialized = false;

  /**
   * Initialize the service (must be called after app.whenReady)
   */
  private ensureInitialized(): void {
    if (this.initialized) return;

    // Get directory containing the executable
    // In development, use app.getAppPath() instead
    const isDev = process.env.NODE_ENV === "development";

    let baseDir: string;
    if (isDev) {
      baseDir = app.getAppPath();
    } else {
      // In production, use the directory containing the executable
      const exePath = app.getPath("exe");
      baseDir = path.dirname(exePath);
    }

    this.configPath = path.join(baseDir, "configs.ini");
    this.config = this.loadConfig();
    this.initialized = true;
  }

  /**
   * Get the config file path
   */
  getConfigPath(): string {
    this.ensureInitialized();
    return this.configPath!;
  }

  /**
   * Load configuration from file
   */
  private loadConfig(): AppConfig {
    try {
      if (!this.configPath || !fs.existsSync(this.configPath)) {
        // Create default config file if not exists
        if (this.configPath) {
          this.saveConfigInternal(DEFAULT_CONFIG);
        }
        return { ...DEFAULT_CONFIG };
      }
      const content = fs.readFileSync(this.configPath, "utf-8");
      return this.parseIni(content);
    } catch (error) {
      console.error("Failed to load config:", error);
      return { ...DEFAULT_CONFIG };
    }
  }

  /**
   * Parse INI format string into AppConfig
   */
  private parseIni(content: string): AppConfig {
    const config: AppConfig = { ...DEFAULT_CONFIG, editor: { ...DEFAULT_CONFIG.editor } };
    let currentSection: "workspace" | "editor" | "general" | null = null;

    const lines = content.split("\n");
    for (const line of lines) {
      const trimmedLine = line.trim();

      // Skip empty lines and comments
      if (!trimmedLine || trimmedLine.startsWith(";") || trimmedLine.startsWith("#")) {
        continue;
      }

      // Check for section header
      const sectionMatch = trimmedLine.match(/^\[(\w+)\]$/);
      if (sectionMatch) {
        const section = sectionMatch[1];
        if (section === "workspace" || section === "editor" || section === "general") {
          currentSection = section;
        }
        continue;
      }

      // Parse key=value
      const keyValueMatch = trimmedLine.match(/^(\w+)\s*=\s*(.*)$/);
      if (keyValueMatch && currentSection) {
        const [, key, value] = keyValueMatch;

        if (currentSection === "workspace") {
          if (key === "path") {
            config.workspace.path = value;
          } else if (key === "defaultNotebook") {
            config.workspace.defaultNotebook = value;
          }
        } else if (currentSection === "editor") {
          if (key === "autoSaveInterval") {
            const interval = parseInt(value, 10);
            if (!isNaN(interval) && interval >= 1000) {
              config.editor.autoSaveInterval = interval;
            }
          }
        } else if (currentSection === "general") {
          if (key === "theme" && ["light", "dark", "system"].includes(value)) {
            config.general.theme = value as "light" | "dark" | "system";
          } else if (key === "language") {
            config.general.language = value;
          }
        }
      }
    }

    return config;
  }

  /**
   * Convert AppConfig to INI format string
   */
  private stringifyIni(config: AppConfig): string {
    const lines: string[] = [];

    // Workspace section
    lines.push("[workspace]");
    lines.push(`path=${config.workspace.path}`);
    lines.push(`defaultNotebook=${config.workspace.defaultNotebook}`);
    lines.push("");

    // Editor section
    lines.push("[editor]");
    lines.push(`autoSaveInterval=${config.editor.autoSaveInterval}`);
    lines.push("");

    // General section
    lines.push("[general]");
    lines.push(`theme=${config.general.theme}`);
    lines.push(`language=${config.general.language}`);

    return lines.join("\n");
  }

  /**
   * Internal save without initialization check (for loadConfig)
   */
  private saveConfigInternal(config: AppConfig): void {
    if (!this.configPath) return;
    try {
      const content = this.stringifyIni(config);
      fs.writeFileSync(this.configPath, content, "utf-8");
    } catch (error) {
      console.error("Failed to save config:", error);
    }
  }

  /**
   * Save configuration to file
   */
  saveConfig(config: AppConfig): void {
    this.ensureInitialized();
    try {
      const content = this.stringifyIni(config);
      fs.writeFileSync(this.configPath!, content, "utf-8");
      this.config = { ...config };
    } catch (error) {
      console.error("Failed to save config:", error);
      throw error;
    }
  }

  /**
   * Get the current configuration
   */
  getConfig(): AppConfig {
    this.ensureInitialized();
    return { ...this.config! };
  }

  /**
   * Get workspace path
   */
  getWorkspacePath(): string {
    this.ensureInitialized();
    return this.config!.workspace.path;
  }

  /**
   * Set workspace path and save
   */
  setWorkspacePath(workspacePath: string): void {
    this.ensureInitialized();
    this.config!.workspace.path = workspacePath;
    this.saveConfig(this.config!);
  }

  /**
   * Reload configuration from file
   */
  reloadConfig(): AppConfig {
    this.ensureInitialized();
    this.config = this.loadConfig();
    return this.getConfig();
  }
}

// Export singleton instance - initialization is lazy
export const configService = new ConfigService();
