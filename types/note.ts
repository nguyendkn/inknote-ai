export interface Note {
  id: string;
  title: string;
  content: string; // Markdown content
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  notebookId: string;
  isPinned?: boolean;
}

export interface CreateNoteInput {
  title?: string;
  content?: string;
  notebookId: string;
  tags?: string[];
}

export interface UpdateNoteInput {
  title?: string;
  content?: string;
  notebookId?: string;
  tags?: string[];
  isPinned?: boolean;
}

export interface NoteMetadata {
  id: string;
  title: string;
  tags: string[];
  notebookId: string;
  isPinned: boolean;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export enum ViewMode {
  EDIT = "EDIT",
  PREVIEW = "PREVIEW",
}
