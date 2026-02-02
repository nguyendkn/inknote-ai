import fs from "fs";
import path from "path";
import crypto from "crypto";
import { app } from "electron";
import { configService } from "./config-service";
import {
  Note,
  NoteMetadata,
  CreateNoteInput,
  UpdateNoteInput,
} from "../types/note";

/**
 * Service for managing notes stored as flat files
 * Each note is stored in its own directory with:
 * - note.md: The markdown content
 * - meta.json: Metadata (title, tags, dates, etc.)
 * - images/: Directory for embedded images
 */
class NotesService {
  private initialized = false;

  private ensureInitialized(): void {
    if (this.initialized) return;
    this.initialized = true;
  }

  /**
   * Get the notes directory path
   */
  private getNotesDir(): string {
    const config = configService.getConfig();
    const basePath = config.workspace.path || app.getPath("userData");
    return path.join(basePath, "notes");
  }

  /**
   * Get the directory for a specific note
   */
  private getNoteDir(noteId: string): string {
    return path.join(this.getNotesDir(), noteId);
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
   * Ensure notes directory exists
   */
  private ensureNotesDir(): void {
    const notesDir = this.getNotesDir();
    if (!fs.existsSync(notesDir)) {
      fs.mkdirSync(notesDir, { recursive: true });
    }
  }

  /**
   * Read metadata from a note directory
   */
  private readMetadata(noteDir: string): NoteMetadata | null {
    const metaPath = path.join(noteDir, "meta.json");
    if (!fs.existsSync(metaPath)) return null;

    try {
      const content = fs.readFileSync(metaPath, "utf-8");
      return JSON.parse(content) as NoteMetadata;
    } catch (error) {
      console.error(`Failed to read metadata from ${metaPath}:`, error);
      return null;
    }
  }

  /**
   * Read content from a note directory
   */
  private readContent(noteDir: string): string {
    const contentPath = path.join(noteDir, "note.md");
    if (!fs.existsSync(contentPath)) return "";

    try {
      return fs.readFileSync(contentPath, "utf-8");
    } catch (error) {
      console.error(`Failed to read content from ${contentPath}:`, error);
      return "";
    }
  }

  /**
   * Write metadata to a note directory
   */
  private writeMetadata(noteDir: string, metadata: NoteMetadata): void {
    const metaPath = path.join(noteDir, "meta.json");
    fs.writeFileSync(metaPath, JSON.stringify(metadata, null, 2), "utf-8");
  }

  /**
   * Write content to a note directory
   */
  private writeContent(noteDir: string, content: string): void {
    const contentPath = path.join(noteDir, "note.md");
    fs.writeFileSync(contentPath, content, "utf-8");
  }

  /**
   * Convert metadata + content to Note object
   */
  private toNote(metadata: NoteMetadata, content: string): Note {
    return {
      id: metadata.id,
      title: metadata.title,
      content,
      tags: metadata.tags,
      notebookId: metadata.notebookId,
      isPinned: metadata.isPinned,
      createdAt: new Date(metadata.createdAt),
      updatedAt: new Date(metadata.updatedAt),
    };
  }

  /**
   * List all notes, optionally filtered by notebook
   */
  async list(notebookId?: string): Promise<Note[]> {
    this.ensureInitialized();
    this.ensureNotesDir();

    const notesDir = this.getNotesDir();
    const notes: Note[] = [];

    try {
      const entries = fs.readdirSync(notesDir, { withFileTypes: true });

      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        if (!this.isValidUUID(entry.name)) continue;

        const noteDir = path.join(notesDir, entry.name);
        const metadata = this.readMetadata(noteDir);
        if (!metadata) continue;

        // Filter by notebook if specified
        if (notebookId && metadata.notebookId !== notebookId) continue;

        const content = this.readContent(noteDir);
        notes.push(this.toNote(metadata, content));
      }

      // Sort by updatedAt descending (most recent first)
      notes.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

      return notes;
    } catch (error) {
      console.error("Failed to list notes:", error);
      return [];
    }
  }

  /**
   * Get a single note by ID
   */
  async get(id: string): Promise<Note | null> {
    this.ensureInitialized();

    if (!this.isValidUUID(id)) {
      console.error(`Invalid note ID: ${id}`);
      return null;
    }

    const noteDir = this.getNoteDir(id);
    if (!fs.existsSync(noteDir)) return null;

    const metadata = this.readMetadata(noteDir);
    if (!metadata) return null;

    const content = this.readContent(noteDir);
    return this.toNote(metadata, content);
  }

  /**
   * Create a new note
   */
  async create(input: CreateNoteInput): Promise<Note> {
    this.ensureInitialized();
    this.ensureNotesDir();

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const metadata: NoteMetadata = {
      id,
      title: input.title || "Untitled",
      tags: input.tags || [],
      notebookId: input.notebookId,
      isPinned: false,
      createdAt: now,
      updatedAt: now,
    };

    const noteDir = this.getNoteDir(id);
    fs.mkdirSync(noteDir, { recursive: true });

    // Create images directory
    fs.mkdirSync(path.join(noteDir, "images"), { recursive: true });

    // Write files
    this.writeMetadata(noteDir, metadata);
    this.writeContent(noteDir, input.content || "");

    return this.toNote(metadata, input.content || "");
  }

  /**
   * Update an existing note
   */
  async update(id: string, input: UpdateNoteInput): Promise<Note | null> {
    this.ensureInitialized();

    if (!this.isValidUUID(id)) {
      console.error(`Invalid note ID: ${id}`);
      return null;
    }

    const noteDir = this.getNoteDir(id);
    if (!fs.existsSync(noteDir)) {
      console.error(`Note not found: ${id}`);
      return null;
    }

    const existingMetadata = this.readMetadata(noteDir);
    if (!existingMetadata) return null;

    const existingContent = this.readContent(noteDir);

    // Merge updates
    const metadata: NoteMetadata = {
      ...existingMetadata,
      title: input.title ?? existingMetadata.title,
      tags: input.tags ?? existingMetadata.tags,
      notebookId: input.notebookId ?? existingMetadata.notebookId,
      isPinned: input.isPinned ?? existingMetadata.isPinned,
      updatedAt: new Date().toISOString(),
    };

    const content = input.content ?? existingContent;

    // Write updated files
    this.writeMetadata(noteDir, metadata);
    this.writeContent(noteDir, content);

    return this.toNote(metadata, content);
  }

  /**
   * Delete a note (hard delete)
   */
  async delete(id: string): Promise<boolean> {
    this.ensureInitialized();

    if (!this.isValidUUID(id)) {
      console.error(`Invalid note ID: ${id}`);
      return false;
    }

    const noteDir = this.getNoteDir(id);
    if (!fs.existsSync(noteDir)) {
      console.error(`Note not found: ${id}`);
      return false;
    }

    try {
      // Recursively delete the note directory
      fs.rmSync(noteDir, { recursive: true, force: true });
      return true;
    } catch (error) {
      console.error(`Failed to delete note ${id}:`, error);
      return false;
    }
  }

  /**
   * Search notes by query (title and content)
   */
  async search(query: string): Promise<Note[]> {
    this.ensureInitialized();

    if (!query.trim()) return [];

    const allNotes = await this.list();
    const lowerQuery = query.toLowerCase();

    return allNotes.filter(
      (note) =>
        note.title.toLowerCase().includes(lowerQuery) ||
        note.content.toLowerCase().includes(lowerQuery) ||
        note.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * Check if a note exists
   */
  async exists(id: string): Promise<boolean> {
    this.ensureInitialized();

    if (!this.isValidUUID(id)) return false;

    const noteDir = this.getNoteDir(id);
    return fs.existsSync(noteDir);
  }
}

// Export singleton instance
export const notesService = new NotesService();
