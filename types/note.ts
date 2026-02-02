export interface Note {
  id: string;
  title: string;
  content: string; // Markdown content
  tags: string[];
  updatedAt: Date;
  notebookId: string;
  isPinned?: boolean;
}

export enum ViewMode {
  EDIT = "EDIT",
  PREVIEW = "PREVIEW",
}
