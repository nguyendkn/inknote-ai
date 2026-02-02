import { ReactNode } from "react";

export interface Notebook {
  id: string;
  name: string;
  parentId?: string | null;
  icon?: ReactNode;
  type?: "folder" | "notebook";
  children?: Notebook[];
  isExpanded?: boolean;
}
