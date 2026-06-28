import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { BrowserTab, Bookmark } from "@/types/browser";

const BROWSER_STATE_KEY = "browser-tabs-state";

type BrowserState = {
  tabs: BrowserTab[];
  activeTabId: string;
  associatedEventId: string | null;   // Track which lesson session these tabs belong to
};

const DEFAULT_INITIAL_TAB: BrowserTab = {
  id: "initial-tab",
  url: "",
  inputUrl: "",
  isLanding: true,
  title: "Tab Baru",
  canGoBack: false,
  canGoForward: false,
  isLoading: false,
};

const loadPersistedTabs = (): BrowserState => {
  try {
    const saved = localStorage.getItem(BROWSER_STATE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed.tabs) && parsed.tabs.length > 0 && parsed.activeTabId) {
        // Simple daily reset: if last session was on a different calendar day, start fresh
        const lastDate = parsed.lastResetDate ? new Date(parsed.lastResetDate) : null;
        const today = new Date().toDateString();

        if (lastDate && lastDate.toDateString() !== today) {
          // New day → return fresh state and persist it immediately
          const fresh = {
            tabs: [DEFAULT_INITIAL_TAB],
            activeTabId: "initial-tab",
            associatedEventId: null,
          };
          savePersistedTabs(fresh.tabs, fresh.activeTabId, fresh.associatedEventId);
          return fresh;
        }

        return {
          tabs: parsed.tabs,
          activeTabId: parsed.activeTabId,
          associatedEventId: parsed.associatedEventId ?? null,
        };
      }
    }
  } catch (e) {
    console.error("Failed to load browser tabs state", e);
  }
  return {
    tabs: [DEFAULT_INITIAL_TAB],
    activeTabId: "initial-tab",
    associatedEventId: null,
  };
};

const savePersistedTabs = (tabs: BrowserTab[], activeTabId: string, associatedEventId: string | null) => {
  try {
    localStorage.setItem(
      BROWSER_STATE_KEY,
      JSON.stringify({
        tabs,
        activeTabId,
        associatedEventId,
        lastResetDate: new Date().toISOString(), // used for daily reset detection
      })
    );
  } catch (e) {
    // ignore
  }
};

const initialState: BrowserState = loadPersistedTabs();

const browserSlice = createSlice({
  name: "browser",
  initialState,
  reducers: {
    setTabs(state, action: PayloadAction<BrowserTab[]>) {
      state.tabs = action.payload;
      if (!state.tabs.find(t => t.id === state.activeTabId)) {
        state.activeTabId = state.tabs[0]?.id || "initial-tab";
      }
      savePersistedTabs(state.tabs, state.activeTabId, state.associatedEventId);
    },

    setActiveTabId(state, action: PayloadAction<string>) {
      if (state.tabs.some(t => t.id === action.payload)) {
        state.activeTabId = action.payload;
        savePersistedTabs(state.tabs, state.activeTabId, state.associatedEventId);
      }
    },

    updateTab(state, action: PayloadAction<{ id: string; updates: Partial<BrowserTab> }>) {
      const { id, updates } = action.payload;
      state.tabs = state.tabs.map(tab =>
        tab.id === id ? { ...tab, ...updates } : tab
      );
      savePersistedTabs(state.tabs, state.activeTabId, state.associatedEventId);
    },

    updateActiveTab(state, action: PayloadAction<Partial<BrowserTab>>) {
      const updates = action.payload;
      state.tabs = state.tabs.map(tab =>
        tab.id === state.activeTabId ? { ...tab, ...updates } : tab
      );
      savePersistedTabs(state.tabs, state.activeTabId, state.associatedEventId);
    },

    addTab(state, action: PayloadAction<{ initialUrl?: string }>) {
      const initialUrl = action.payload?.initialUrl || "";
      const newId = `tab-${Date.now()}`;
      const newTab: BrowserTab = {
        id: newId,
        url: initialUrl,
        inputUrl: initialUrl,
        isLanding: initialUrl === "",
        title: initialUrl ? "Loading..." : "Tab Baru",
        canGoBack: false,
        canGoForward: false,
        isLoading: false,
      };
      state.tabs.push(newTab);
      state.activeTabId = newId;
      savePersistedTabs(state.tabs, state.activeTabId, state.associatedEventId);
    },

    closeTab(state, action: PayloadAction<string>) {
      const idToClose = action.payload;
      if (state.tabs.length === 1) {
        state.tabs = [DEFAULT_INITIAL_TAB];
        state.activeTabId = "initial-tab";
        savePersistedTabs(state.tabs, state.activeTabId, state.associatedEventId);
        return;
      }

      const tabIndex = state.tabs.findIndex(t => t.id === idToClose);
      const newTabs = state.tabs.filter(t => t.id !== idToClose);
      state.tabs = newTabs;

      if (state.activeTabId === idToClose) {
        const nextActiveIndex = tabIndex > 0 ? tabIndex - 1 : 0;
        state.activeTabId = newTabs[nextActiveIndex]?.id || newTabs[0].id;
      }
      savePersistedTabs(state.tabs, state.activeTabId, state.associatedEventId);
    },

    resetBrowser(state) {
      state.tabs = [DEFAULT_INITIAL_TAB];
      state.activeTabId = "initial-tab";
      state.associatedEventId = null;
      savePersistedTabs(state.tabs, state.activeTabId, state.associatedEventId);
    },

    setAssociatedEventId(state, action: PayloadAction<string | null>) {
      state.associatedEventId = action.payload;
      savePersistedTabs(state.tabs, state.activeTabId, state.associatedEventId);
    },

    /**
     * Smart action: start a new lesson session.
     * Only resets tabs if the eventId is different.
     * This is the main trigger for "new session pelajaran".
     */
    beginNewBrowserSession(state, action: PayloadAction<string>) {
      const newEventId = action.payload;
      if (state.associatedEventId !== newEventId) {
        state.tabs = [DEFAULT_INITIAL_TAB];
        state.activeTabId = "initial-tab";
      }
      state.associatedEventId = newEventId;
      savePersistedTabs(state.tabs, state.activeTabId, state.associatedEventId);
    },

    // Used to hydrate or force replace (e.g. after session change)
    replaceBrowserState(state, action: PayloadAction<BrowserState>) {
      const payload = action.payload;
      state.tabs = payload.tabs.length > 0 ? payload.tabs : [DEFAULT_INITIAL_TAB];
      state.activeTabId = payload.activeTabId || state.tabs[0].id;
      state.associatedEventId = payload.associatedEventId ?? null;
      savePersistedTabs(state.tabs, state.activeTabId, state.associatedEventId);
    },
  },
});

export const {
  setTabs,
  setActiveTabId,
  updateTab,
  updateActiveTab,
  addTab,
  closeTab,
  resetBrowser,
  setAssociatedEventId,
  beginNewBrowserSession,
  replaceBrowserState,
} = browserSlice.actions;

export default browserSlice.reducer;
