import { ReactNode } from "react";

export interface Notebook {
  id: string;
  name: string;
  parentId?: string | null;
  icon?: ReactNode;
  iconName?: string;
  type?: "folder" | "notebook";
  children?: Notebook[];
  isExpanded?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface NotebookMetadata {
  id: string;
  name: string;
  parentId: string | null;
  iconName: string | null;
  type: "folder" | "notebook";
  createdAt: string;
  updatedAt: string;
}

export interface CreateNotebookInput {
  name: string;
  parentId?: string | null;
  iconName?: string;
  type?: "folder" | "notebook";
}

export interface UpdateNotebookInput {
  name?: string;
  parentId?: string | null;
  iconName?: string;
}
