"use client";

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import {
  Notebook,
  CreateNotebookInput,
  UpdateNotebookInput,
} from "@/types/notebook";
import * as notebooksService from "@/lib/services/notebooks-service";

interface NotebooksState {
  notebooks: Notebook[];
  flatNotebooks: Notebook[];
  isLoading: boolean;
  error: string | null;
}

type NotebooksAction =
  | { type: "SET_NOTEBOOKS"; payload: { tree: Notebook[]; flat: Notebook[] } }
  | { type: "ADD_NOTEBOOK"; payload: Notebook }
  | { type: "UPDATE_NOTEBOOK"; payload: Notebook }
  | { type: "DELETE_NOTEBOOK"; payload: string }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null };

const initialState: NotebooksState = {
  notebooks: [],
  flatNotebooks: [],
  isLoading: true,
  error: null,
};

function notebooksReducer(
  state: NotebooksState,
  action: NotebooksAction
): NotebooksState {
  switch (action.type) {
    case "SET_NOTEBOOKS":
      return {
        ...state,
        notebooks: action.payload.tree,
        flatNotebooks: action.payload.flat,
        isLoading: false,
      };
    case "ADD_NOTEBOOK":
      return {
        ...state,
        flatNotebooks: [...state.flatNotebooks, action.payload],
      };
    case "UPDATE_NOTEBOOK":
      return {
        ...state,
        flatNotebooks: state.flatNotebooks.map((nb) =>
          nb.id === action.payload.id ? action.payload : nb
        ),
      };
    case "DELETE_NOTEBOOK":
      return {
        ...state,
        flatNotebooks: state.flatNotebooks.filter(
          (nb) => nb.id !== action.payload
        ),
      };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

interface NotebooksContextValue extends NotebooksState {
  createNotebook: (input: CreateNotebookInput) => Promise<Notebook>;
  updateNotebook: (id: string, data: UpdateNotebookInput) => Promise<void>;
  deleteNotebook: (id: string, deleteChildren?: boolean) => Promise<void>;
  refreshNotebooks: () => Promise<void>;
  getNotebookById: (id: string) => Notebook | undefined;
}

const NotebooksContext = createContext<NotebooksContextValue | null>(null);

interface NotebooksProviderProps {
  children: ReactNode;
}

export function NotebooksProvider({ children }: NotebooksProviderProps) {
  const [state, dispatch] = useReducer(notebooksReducer, initialState);

  const loadNotebooks = useCallback(async () => {
    dispatch({ type: "SET_LOADING", payload: true });
    dispatch({ type: "SET_ERROR", payload: null });
    try {
      const [tree, flat] = await Promise.all([
        notebooksService.listNotebooks(),
        notebooksService.listNotebooksFlat(),
      ]);
      dispatch({ type: "SET_NOTEBOOKS", payload: { tree, flat } });
    } catch (error) {
      console.error("Failed to load notebooks:", error);
      dispatch({ type: "SET_ERROR", payload: "Failed to load notebooks" });
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  useEffect(() => {
    loadNotebooks();
  }, [loadNotebooks]);

  const createNotebook = useCallback(
    async (input: CreateNotebookInput): Promise<Notebook> => {
      try {
        const notebook = await notebooksService.createNotebook(input);
        dispatch({ type: "ADD_NOTEBOOK", payload: notebook });
        // Refresh to get proper tree structure
        await loadNotebooks();
        return notebook;
      } catch (error) {
        console.error("Failed to create notebook:", error);
        dispatch({ type: "SET_ERROR", payload: "Failed to create notebook" });
        throw error;
      }
    },
    [loadNotebooks]
  );

  const updateNotebook = useCallback(
    async (id: string, data: UpdateNotebookInput) => {
      try {
        const notebook = await notebooksService.updateNotebook(id, data);
        if (notebook) {
          dispatch({ type: "UPDATE_NOTEBOOK", payload: notebook });
          // Refresh to get proper tree structure
          await loadNotebooks();
        }
      } catch (error) {
        console.error("Failed to update notebook:", error);
        dispatch({ type: "SET_ERROR", payload: "Failed to update notebook" });
      }
    },
    [loadNotebooks]
  );

  const deleteNotebook = useCallback(
    async (id: string, deleteChildren: boolean = true) => {
      try {
        const success = await notebooksService.deleteNotebook(
          id,
          deleteChildren
        );
        if (success) {
          dispatch({ type: "DELETE_NOTEBOOK", payload: id });
          // Refresh to get proper tree structure
          await loadNotebooks();
        } else {
          dispatch({ type: "SET_ERROR", payload: "Failed to delete notebook" });
        }
      } catch (error) {
        console.error("Failed to delete notebook:", error);
        dispatch({ type: "SET_ERROR", payload: "Failed to delete notebook" });
      }
    },
    [loadNotebooks]
  );

  const getNotebookById = useCallback(
    (id: string) => {
      return state.flatNotebooks.find((nb) => nb.id === id);
    },
    [state.flatNotebooks]
  );

  return (
    <NotebooksContext.Provider
      value={{
        ...state,
        createNotebook,
        updateNotebook,
        deleteNotebook,
        refreshNotebooks: loadNotebooks,
        getNotebookById,
      }}
    >
      {children}
    </NotebooksContext.Provider>
  );
}

export function useNotebooks() {
  const context = useContext(NotebooksContext);
  if (!context) {
    throw new Error("useNotebooks must be used within NotebooksProvider");
  }
  return context;
}
