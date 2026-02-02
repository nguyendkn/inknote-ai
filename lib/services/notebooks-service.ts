"use client";

import {
  Notebook,
  CreateNotebookInput,
  UpdateNotebookInput,
} from "@/types/notebook";

// Check if running in Electron with notebooks API
const isElectron =
  typeof window !== "undefined" &&
  window.electronAPI &&
  window.electronAPI.notebooks;

console.log("[notebooks-service] isElectron:", !!isElectron);

// Mock notebooks for browser development mode
const MOCK_NOTEBOOKS: Notebook[] = [
  {
    id: "mock-inbox",
    name: "Inbox",
    type: "folder",
    parentId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "mock-work",
    name: "Work",
    type: "folder",
    parentId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "mock-personal",
    name: "Personal",
    type: "folder",
    parentId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

/**
 * Convert JSON dates to Date objects
 */
function hydrateNotebook(notebook: Notebook): Notebook {
  return {
    ...notebook,
    createdAt: notebook.createdAt ? new Date(notebook.createdAt) : undefined,
    updatedAt: notebook.updatedAt ? new Date(notebook.updatedAt) : undefined,
    children: notebook.children?.map(hydrateNotebook),
  };
}

/**
 * List all notebooks (tree structure)
 */
export async function listNotebooks(): Promise<Notebook[]> {
  if (!isElectron) {
    console.log("[notebooks-service] Using MOCK_NOTEBOOKS fallback (tree)");
    return MOCK_NOTEBOOKS;
  }
  const notebooks = await window.electronAPI!.notebooks.list();
  return notebooks.map(hydrateNotebook);
}

/**
 * List all notebooks (flat structure)
 */
export async function listNotebooksFlat(): Promise<Notebook[]> {
  if (!isElectron) {
    console.log("[notebooks-service] Using MOCK_NOTEBOOKS fallback (flat)");
    return MOCK_NOTEBOOKS;
  }
  const notebooks = await window.electronAPI!.notebooks.listFlat();
  return notebooks.map(hydrateNotebook);
}

/**
 * Get a notebook by ID
 */
export async function getNotebook(id: string): Promise<Notebook | null> {
  if (!isElectron) {
    return MOCK_NOTEBOOKS.find((nb) => nb.id === id) || null;
  }
  const notebook = await window.electronAPI!.notebooks.get(id);
  return notebook ? hydrateNotebook(notebook) : null;
}

/**
 * Create a new notebook
 */
export async function createNotebook(
  input: CreateNotebookInput
): Promise<Notebook> {
  if (!isElectron) {
    // Mock create for browser development
    console.warn(
      "[notebooks-service] Mock create - notebooks require Electron"
    );
    const mockNotebook: Notebook = {
      id: `mock-${Date.now()}`,
      name: input.name,
      type: input.type || "folder",
      parentId: input.parentId || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    MOCK_NOTEBOOKS.push(mockNotebook);
    return mockNotebook;
  }
  const notebook = await window.electronAPI!.notebooks.create(input);
  return hydrateNotebook(notebook);
}

/**
 * Update a notebook
 */
export async function updateNotebook(
  id: string,
  data: UpdateNotebookInput
): Promise<Notebook | null> {
  if (!isElectron) {
    console.warn(
      "[notebooks-service] Mock update - notebooks require Electron"
    );
    const index = MOCK_NOTEBOOKS.findIndex((nb) => nb.id === id);
    if (index === -1) return null;
    MOCK_NOTEBOOKS[index] = {
      ...MOCK_NOTEBOOKS[index],
      ...data,
      updatedAt: new Date(),
    };
    return MOCK_NOTEBOOKS[index];
  }
  const notebook = await window.electronAPI!.notebooks.update(id, data);
  return notebook ? hydrateNotebook(notebook) : null;
}

/**
 * Delete a notebook
 */
export async function deleteNotebook(
  id: string,
  deleteChildren: boolean = true
): Promise<boolean> {
  if (!isElectron) {
    console.warn(
      "[notebooks-service] Mock delete - notebooks require Electron"
    );
    const index = MOCK_NOTEBOOKS.findIndex((nb) => nb.id === id);
    if (index === -1) return false;
    MOCK_NOTEBOOKS.splice(index, 1);
    return true;
  }
  return window.electronAPI!.notebooks.delete(id, deleteChildren);
}
