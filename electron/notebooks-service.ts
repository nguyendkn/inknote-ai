import fs from "fs";
import path from "path";
import crypto from "crypto";
import { app } from "electron";
import { configService } from "./config-service";
import {
  Notebook,
  NotebookMetadata,
  CreateNotebookInput,
  UpdateNotebookInput,
} from "../types/notebook";

/**
 * Service for managing notebooks stored in a JSON file
 * Structure: {workspace}/notebooks.json
 */
class NotebooksService {
  private initialized = false;

  private ensureInitialized(): void {
    if (this.initialized) return;
    this.initialized = true;
  }

  /**
   * Get the notebooks file path
   */
  private getNotebooksPath(): string {
    const config = configService.getConfig();
    const basePath = config.workspace.path || app.getPath("userData");
    return path.join(basePath, "notebooks.json");
  }

  /**
   * Validate UUID format
   */
  private isValidUUID(id: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  }

  /**
   * Read all notebooks from file
   */
  private readNotebooks(): NotebookMetadata[] {
    const filePath = this.getNotebooksPath();
    if (!fs.existsSync(filePath)) {
      return [];
    }

    try {
      const content = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(content) as NotebookMetadata[];
    } catch (error) {
      console.error("Failed to read notebooks:", error);
      return [];
    }
  }

  /**
   * Write notebooks to file
   */
  private writeNotebooks(notebooks: NotebookMetadata[]): void {
    const filePath = this.getNotebooksPath();
    const dir = path.dirname(filePath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(filePath, JSON.stringify(notebooks, null, 2), "utf-8");
  }

  /**
   * Convert metadata to Notebook object
   */
  private toNotebook(metadata: NotebookMetadata): Notebook {
    return {
      id: metadata.id,
      name: metadata.name,
      parentId: metadata.parentId,
      iconName: metadata.iconName || undefined,
      type: metadata.type,
      createdAt: new Date(metadata.createdAt),
      updatedAt: new Date(metadata.updatedAt),
    };
  }

  /**
   * Build tree structure from flat list
   */
  private buildTree(notebooks: Notebook[]): Notebook[] {
    const map = new Map<string, Notebook>();
    const roots: Notebook[] = [];

    // First pass: create map
    for (const nb of notebooks) {
      map.set(nb.id, { ...nb, children: [] });
    }

    // Second pass: build tree
    for (const nb of notebooks) {
      const node = map.get(nb.id)!;
      if (nb.parentId && map.has(nb.parentId)) {
        const parent = map.get(nb.parentId)!;
        parent.children = parent.children || [];
        parent.children.push(node);
      } else {
        roots.push(node);
      }
    }

    return roots;
  }

  /**
   * List all notebooks as tree structure
   */
  async list(): Promise<Notebook[]> {
    this.ensureInitialized();

    const metadataList = this.readNotebooks();
    const notebooks = metadataList.map((m) => this.toNotebook(m));
    return this.buildTree(notebooks);
  }

  /**
   * List all notebooks as flat list
   */
  async listFlat(): Promise<Notebook[]> {
    this.ensureInitialized();

    const metadataList = this.readNotebooks();
    return metadataList.map((m) => this.toNotebook(m));
  }

  /**
   * Get a single notebook by ID
   */
  async get(id: string): Promise<Notebook | null> {
    this.ensureInitialized();

    if (!this.isValidUUID(id)) {
      console.error(`Invalid notebook ID: ${id}`);
      return null;
    }

    const metadataList = this.readNotebooks();
    const metadata = metadataList.find((m) => m.id === id);
    if (!metadata) return null;

    return this.toNotebook(metadata);
  }

  /**
   * Create a new notebook
   */
  async create(input: CreateNotebookInput): Promise<Notebook> {
    this.ensureInitialized();

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const metadata: NotebookMetadata = {
      id,
      name: input.name || "Untitled",
      parentId: input.parentId || null,
      iconName: input.iconName || null,
      type: input.type || "folder",
      createdAt: now,
      updatedAt: now,
    };

    const notebooks = this.readNotebooks();
    notebooks.push(metadata);
    this.writeNotebooks(notebooks);

    return this.toNotebook(metadata);
  }

  /**
   * Update an existing notebook
   */
  async update(id: string, input: UpdateNotebookInput): Promise<Notebook | null> {
    this.ensureInitialized();

    if (!this.isValidUUID(id)) {
      console.error(`Invalid notebook ID: ${id}`);
      return null;
    }

    const notebooks = this.readNotebooks();
    const index = notebooks.findIndex((m) => m.id === id);

    if (index === -1) {
      console.error(`Notebook not found: ${id}`);
      return null;
    }

    const existing = notebooks[index];
    const updated: NotebookMetadata = {
      ...existing,
      name: input.name ?? existing.name,
      parentId: input.parentId !== undefined ? input.parentId : existing.parentId,
      iconName: input.iconName !== undefined ? input.iconName : existing.iconName,
      updatedAt: new Date().toISOString(),
    };

    notebooks[index] = updated;
    this.writeNotebooks(notebooks);

    return this.toNotebook(updated);
  }

  /**
   * Delete a notebook (and optionally its children)
   */
  async delete(id: string, deleteChildren: boolean = true): Promise<boolean> {
    this.ensureInitialized();

    if (!this.isValidUUID(id)) {
      console.error(`Invalid notebook ID: ${id}`);
      return false;
    }

    let notebooks = this.readNotebooks();
    const index = notebooks.findIndex((m) => m.id === id);

    if (index === -1) {
      console.error(`Notebook not found: ${id}`);
      return false;
    }

    if (deleteChildren) {
      // Recursively find all children IDs
      const idsToDelete = new Set<string>([id]);
      let changed = true;
      while (changed) {
        changed = false;
        for (const nb of notebooks) {
          if (nb.parentId && idsToDelete.has(nb.parentId) && !idsToDelete.has(nb.id)) {
            idsToDelete.add(nb.id);
            changed = true;
          }
        }
      }
      notebooks = notebooks.filter((m) => !idsToDelete.has(m.id));
    } else {
      // Just delete this notebook, move children to root
      notebooks = notebooks.map((m) => {
        if (m.parentId === id) {
          return { ...m, parentId: null, updatedAt: new Date().toISOString() };
        }
        return m;
      }).filter((m) => m.id !== id);
    }

    this.writeNotebooks(notebooks);
    return true;
  }

  /**
   * Check if a notebook exists
   */
  async exists(id: string): Promise<boolean> {
    this.ensureInitialized();

    if (!this.isValidUUID(id)) return false;

    const notebooks = this.readNotebooks();
    return notebooks.some((m) => m.id === id);
  }
}

// Export singleton instance
export const notebooksService = new NotebooksService();
