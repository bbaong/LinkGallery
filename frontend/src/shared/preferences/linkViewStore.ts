import { create } from "zustand";
import {
  LINK_VIEW_STORAGE_KEY,
  readLinkViewMode,
  type LinkViewMode,
} from "./linkView";

interface LinkViewState {
  mode: LinkViewMode;
  setMode: (mode: LinkViewMode) => void;
}

export const useLinkViewStore = create<LinkViewState>((set) => ({
  mode: typeof window === "undefined" ? "card" : readLinkViewMode(),
  setMode: (mode) => {
    try {
      localStorage.setItem(LINK_VIEW_STORAGE_KEY, mode);
    } catch {
      /* ignore */
    }
    set({ mode });
  },
}));
