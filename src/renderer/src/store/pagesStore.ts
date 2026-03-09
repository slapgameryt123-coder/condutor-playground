import { create } from 'zustand'
import type {
  CollectionData,
  CollectionEntryData,
  CollectionKind,
  CollectionViewData,
  PageData,
  WorkspaceStateSnapshot,
} from '../../../preload/index'

export const TRASH_PAGE_ID = '__trash__'
const PRIMARY_PANE_ID = 'pane-primary'
const SECONDARY_PANE_ID = 'pane-secondary'
const WORKSPACE_SAVE_DELAY_MS = 250

let workspaceSaveTimeout: ReturnType<typeof setTimeout> | undefined

export function isTrashPageId(id: string | null): id is typeof TRASH_PAGE_ID {
  return id === TRASH_PAGE_ID
}

export type PageListItem = {
  id: string
  title: string
  emoji: string
  parent_id: string | null
  sort_order: number
  is_trashed: boolean
  created_at: string
  updated_at: string
}

export type CollectionWithViews = CollectionData & {
  views: CollectionViewData[]
}

export type PaneView = 'page' | 'trash'

export type WorkspacePane = {
  id: string
  tabIds: string[]
  activeTabId: string | null
  view: PaneView
}

export type WorkspaceState = {
  layout: 'single' | 'vertical-split'
  splitRatio: number
  activePaneId: string
  panes: Record<string, WorkspacePane>
}

function defaultWorkspace(): WorkspaceState {
  return {
    layout: 'single',
    splitRatio: 0.5,
    activePaneId: PRIMARY_PANE_ID,
    panes: {
      [PRIMARY_PANE_ID]: {
        id: PRIMARY_PANE_ID,
        tabIds: [],
        activeTabId: null,
        view: 'page',
      },
    },
  }
}

function clampSplitRatio(value: number): number {
  return Math.min(0.75, Math.max(0.25, value))
}

function toSnapshot(workspace: WorkspaceState, sidebarOpen: boolean): WorkspaceStateSnapshot {
  return {
    layout: workspace.layout,
    splitRatio: workspace.splitRatio,
    activePaneId: workspace.activePaneId,
    panes: Object.values(workspace.panes).map((pane) => ({
      id: pane.id,
      tabIds: pane.tabIds,
      activeTabId: pane.activeTabId,
      view: pane.view,
    })),
    sidebarOpen,
  }
}

function fromSnapshot(snapshot: WorkspaceStateSnapshot | null): {
  workspace: WorkspaceState
  sidebarOpen: boolean
} {
  if (!snapshot || !Array.isArray(snapshot.panes) || snapshot.panes.length === 0) {
    return { workspace: defaultWorkspace(), sidebarOpen: true }
  }

  const panes = Object.fromEntries(
    snapshot.panes.map((pane) => [
      pane.id,
      {
        id: pane.id,
        tabIds: pane.tabIds,
        activeTabId: pane.activeTabId,
        view: pane.view,
      },
    ])
  )

  const activePaneId = panes[snapshot.activePaneId] ? snapshot.activePaneId : snapshot.panes[0].id

  return {
    workspace: {
      layout: snapshot.layout === 'vertical-split' ? 'vertical-split' : 'single',
      splitRatio: clampSplitRatio(snapshot.splitRatio || 0.5),
      activePaneId,
      panes,
    },
    sidebarOpen: snapshot.sidebarOpen ?? true,
  }
}

interface PagesState {
  pages: PageListItem[]
  pageCache: Record<string, PageData>
  activePage: PageData | null
  activePageId: string | null
  sidebarOpen: boolean
  searchQuery: string
  searchResults: PageListItem[]
  expandedIds: Set<string>
  workspace: WorkspaceState
  collections: CollectionData[]
  collectionViews: Record<string, CollectionViewData[]>
  collectionEntries: Record<string, CollectionEntryData[]>

  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  setSearchQuery: (query: string) => void
  runSearch: (query: string) => Promise<void>
  setSearchResults: (results: PageListItem[]) => void
  toggleExpanded: (id: string) => void

  loadPages: () => Promise<void>
  loadWorkspaceState: () => Promise<void>
  persistWorkspaceState: () => void
  selectPage: (id: string) => Promise<void>
  selectTrash: () => void
  createPage: (parentId?: string) => Promise<string>
  updatePage: (id: string, data: Partial<Pick<PageData, 'title' | 'emoji' | 'content'>>) => Promise<void>
  trashPage: (id: string) => Promise<void>
  restorePage: (id: string) => Promise<void>
  deletePage: (id: string) => Promise<void>
  reorderSiblingPages: (parentId: string | null, orderedIds: string[]) => Promise<void>

  loadCollections: () => Promise<void>
  createCollection: (data: {
    name: string
    kind: CollectionKind
    parent_page_id?: string | null
    icon?: string
  }) => Promise<CollectionData>
  updateCollection: (id: string, data: Partial<Pick<CollectionData, 'name' | 'icon' | 'kind'>>) => Promise<void>
  deleteCollection: (id: string) => Promise<void>
  loadCollectionViews: (collectionId: string) => Promise<void>
  createCollectionView: (data: {
    collection_id: string
    name: string
    type: CollectionKind
  }) => Promise<CollectionViewData | null>
  loadCollectionEntries: (collectionId: string) => Promise<void>
  createCollectionEntry: (data: {
    collection_id: string
    properties?: { title?: string; description?: string; status?: string }
  }) => Promise<CollectionEntryData | null>
  updateCollectionEntry: (
    id: string,
    data: { properties?: { title?: string; description?: string; status?: string } }
  ) => Promise<void>
  deleteCollectionEntry: (id: string, collectionId: string) => Promise<void>
  getCollectionWithViews: (collectionId: string) => CollectionWithViews | null

  openPageInPane: (pageId: string, paneId?: string, options?: { activate?: boolean; dedupe?: boolean }) => Promise<void>
  openPageInActivePane: (pageId: string) => Promise<void>
  openPageInNewTab: (pageId: string) => Promise<void>
  closeTab: (paneId: string, pageId: string) => Promise<void>
  activateTab: (paneId: string, pageId: string) => Promise<void>
  splitActivePane: () => Promise<void>
  closePane: (paneId: string) => Promise<void>
  focusPane: (paneId: string) => void
  setSplitRatio: (ratio: number) => void
  toggleSplitView: () => Promise<void>
}

function resolveActivePageId(workspace: WorkspaceState): string | null {
  const activePane = workspace.panes[workspace.activePaneId]
  if (!activePane) return null
  if (activePane.view === 'trash') return TRASH_PAGE_ID
  return activePane.activeTabId
}

function syncDerivedActiveState(state: Pick<PagesState, 'workspace' | 'pageCache'>): Pick<PagesState, 'activePageId' | 'activePage'> {
  const resolvedId = resolveActivePageId(state.workspace)
  if (!resolvedId || isTrashPageId(resolvedId)) {
    return { activePageId: resolvedId, activePage: null }
  }

  return {
    activePageId: resolvedId,
    activePage: state.pageCache[resolvedId] ?? null,
  }
}

function sanitizeWorkspace(workspace: WorkspaceState, pages: PageListItem[]): WorkspaceState {
  const validIds = new Set(pages.filter((page) => !page.is_trashed).map((page) => page.id))
  const nextPanes: Record<string, WorkspacePane> = {}

  for (const pane of Object.values(workspace.panes)) {
    const tabIds = pane.tabIds.filter((id) => validIds.has(id))
    const activeTabId = pane.activeTabId && tabIds.includes(pane.activeTabId) ? pane.activeTabId : tabIds[0] ?? null
    nextPanes[pane.id] = {
      ...pane,
      tabIds,
      activeTabId,
      view: pane.view,
    }
  }

  if (!nextPanes[PRIMARY_PANE_ID]) {
    nextPanes[PRIMARY_PANE_ID] = {
      id: PRIMARY_PANE_ID,
      tabIds: [],
      activeTabId: null,
      view: 'page',
    }
  }

  const activePaneId = nextPanes[workspace.activePaneId] ? workspace.activePaneId : PRIMARY_PANE_ID

  if (workspace.layout === 'vertical-split' && !nextPanes[SECONDARY_PANE_ID]) {
    nextPanes[SECONDARY_PANE_ID] = {
      id: SECONDARY_PANE_ID,
      tabIds: [],
      activeTabId: null,
      view: 'page',
    }
  }

  const layout = workspace.layout === 'vertical-split' && nextPanes[SECONDARY_PANE_ID] ? 'vertical-split' : 'single'

  return {
    layout,
    splitRatio: clampSplitRatio(workspace.splitRatio),
    activePaneId,
    panes: nextPanes,
  }
}

export const usePagesStore = create<PagesState>((set, get) => ({
  pages: [],
  pageCache: {},
  activePage: null,
  activePageId: null,
  sidebarOpen: true,
  searchQuery: '',
  searchResults: [],
  expandedIds: new Set<string>(),
  workspace: defaultWorkspace(),
  collections: [],
  collectionViews: {},
  collectionEntries: {},

  setSidebarOpen: (open) => {
    set({ sidebarOpen: open })
    get().persistWorkspaceState()
  },
  toggleSidebar: () => {
    set((state) => ({ sidebarOpen: !state.sidebarOpen }))
    get().persistWorkspaceState()
  },
  setSearchQuery: (query) => set({ searchQuery: query }),
  runSearch: async (query) => {
    const trimmed = query.trim()

    if (!trimmed) {
      set({ searchResults: [] })
      return
    }

    const results = await window.api.searchPages(trimmed)
    if (get().searchQuery.trim() === trimmed) {
      set({ searchResults: results })
    }
  },
  setSearchResults: (results) => set({ searchResults: results }),

  toggleExpanded: (id) =>
    set((state) => {
      const next = new Set(state.expandedIds)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return { expandedIds: next }
    }),

  loadPages: async () => {
    const pages = await window.api.listPages()

    set((state) => {
      const workspace = sanitizeWorkspace(state.workspace, pages)
      return {
        pages,
        workspace,
        ...syncDerivedActiveState({ workspace, pageCache: state.pageCache }),
      }
    })
  },

  loadWorkspaceState: async () => {
    const snapshot = await window.api.getWorkspaceState()

    set((state) => {
      const loaded = fromSnapshot(snapshot)
      const workspace = sanitizeWorkspace(loaded.workspace, state.pages)
      return {
        workspace,
        sidebarOpen: loaded.sidebarOpen,
        ...syncDerivedActiveState({ workspace, pageCache: state.pageCache }),
      }
    })
  },

  persistWorkspaceState: () => {
    if (workspaceSaveTimeout) clearTimeout(workspaceSaveTimeout)

    workspaceSaveTimeout = setTimeout(() => {
      const { workspace, sidebarOpen } = get()
      void window.api.setWorkspaceState(toSnapshot(workspace, sidebarOpen))
    }, WORKSPACE_SAVE_DELAY_MS)
  },

  loadCollections: async () => {
    const collections = await window.api.listCollections()
    set({ collections })
  },

  createCollection: async (data) => {
    const collection = await window.api.createCollection(data)
    set((state) => ({
      collections: [collection, ...state.collections.filter((entry) => entry.id !== collection.id)],
    }))

    const views = await window.api.listCollectionViews(collection.id)
    const entries = await window.api.listCollectionEntries(collection.id)

    set((state) => ({
      collectionViews: {
        ...state.collectionViews,
        [collection.id]: views,
      },
      collectionEntries: {
        ...state.collectionEntries,
        [collection.id]: entries,
      },
    }))

    return collection
  },

  updateCollection: async (id, data) => {
    const updated = await window.api.updateCollection(id, data)
    if (!updated) return

    set((state) => ({
      collections: state.collections.map((collection) => (collection.id === id ? updated : collection)),
    }))
  },

  deleteCollection: async (id) => {
    await window.api.deleteCollection(id)
    set((state) => {
      const nextViews = { ...state.collectionViews }
      const nextEntries = { ...state.collectionEntries }
      delete nextViews[id]
      delete nextEntries[id]
      return {
        collections: state.collections.filter((collection) => collection.id !== id),
        collectionViews: nextViews,
        collectionEntries: nextEntries,
      }
    })
  },

  loadCollectionViews: async (collectionId) => {
    const views = await window.api.listCollectionViews(collectionId)
    set((state) => ({
      collectionViews: {
        ...state.collectionViews,
        [collectionId]: views,
      },
    }))
  },

  createCollectionView: async (data) => {
    const view = await window.api.createCollectionView(data)
    if (!view) return null

    set((state) => ({
      collectionViews: {
        ...state.collectionViews,
        [data.collection_id]: [...(state.collectionViews[data.collection_id] ?? []), view],
      },
    }))

    return view
  },

  loadCollectionEntries: async (collectionId) => {
    const entries = await window.api.listCollectionEntries(collectionId)
    set((state) => ({
      collectionEntries: {
        ...state.collectionEntries,
        [collectionId]: entries,
      },
    }))
  },

  createCollectionEntry: async (data) => {
    const entry = await window.api.createCollectionEntry(data)
    if (!entry) return null

    set((state) => ({
      collectionEntries: {
        ...state.collectionEntries,
        [data.collection_id]: [...(state.collectionEntries[data.collection_id] ?? []), entry],
      },
    }))

    return entry
  },

  updateCollectionEntry: async (id, data) => {
    const updated = await window.api.updateCollectionEntry(id, data)
    if (!updated) return

    set((state) => ({
      collectionEntries: Object.fromEntries(
        Object.entries(state.collectionEntries).map(([collectionId, entries]) => [
          collectionId,
          entries.map((entry) => (entry.id === updated.id ? updated : entry)),
        ])
      ),
    }))
  },

  deleteCollectionEntry: async (id, collectionId) => {
    await window.api.deleteCollectionEntry(id)
    set((state) => ({
      collectionEntries: {
        ...state.collectionEntries,
        [collectionId]: (state.collectionEntries[collectionId] ?? []).filter((entry) => entry.id !== id),
      },
    }))
  },

  getCollectionWithViews: (collectionId) => {
    const state = get()
    const collection = state.collections.find((entry) => entry.id === collectionId)
    if (!collection) return null

    return {
      ...collection,
      views: state.collectionViews[collectionId] ?? [],
    }
  },

  openPageInPane: async (pageId, paneId, options) => {
    const { workspace } = get()
    const targetPaneId = paneId ?? workspace.activePaneId
    const pane = workspace.panes[targetPaneId]
    if (!pane) return

    const page = await window.api.getPage(pageId)

    set((state) => {
      const currentPane = state.workspace.panes[targetPaneId]
      if (!currentPane) return state

      const dedupe = options?.dedupe ?? true
      const activate = options?.activate ?? true
      const hasTab = currentPane.tabIds.includes(pageId)

      const tabIds = dedupe && hasTab ? currentPane.tabIds : [...currentPane.tabIds, pageId]

      const nextPane: WorkspacePane = {
        ...currentPane,
        tabIds,
        activeTabId: activate ? pageId : currentPane.activeTabId ?? pageId,
        view: 'page',
      }

      const nextWorkspace: WorkspaceState = {
        ...state.workspace,
        activePaneId: targetPaneId,
        panes: {
          ...state.workspace.panes,
          [targetPaneId]: nextPane,
        },
      }

      const pageCache = {
        ...state.pageCache,
        [pageId]: page,
      }

      return {
        workspace: nextWorkspace,
        pageCache,
        ...syncDerivedActiveState({ workspace: nextWorkspace, pageCache }),
      }
    })

    get().persistWorkspaceState()
  },

  openPageInActivePane: async (pageId) => {
    await get().openPageInPane(pageId, undefined, { activate: true, dedupe: true })
  },

  openPageInNewTab: async (pageId) => {
    await get().openPageInPane(pageId, undefined, { activate: true, dedupe: false })
  },

  selectPage: async (id) => {
    await get().openPageInActivePane(id)
  },

  selectTrash: () => {
    set((state) => {
      const activePane = state.workspace.panes[state.workspace.activePaneId]
      if (!activePane) return state

      const workspace: WorkspaceState = {
        ...state.workspace,
        panes: {
          ...state.workspace.panes,
          [activePane.id]: {
            ...activePane,
            view: 'trash',
          },
        },
      }

      return {
        workspace,
        ...syncDerivedActiveState({ workspace, pageCache: state.pageCache }),
      }
    })

    get().persistWorkspaceState()
  },

  closeTab: async (paneId, pageId) => {
    set((state) => {
      const pane = state.workspace.panes[paneId]
      if (!pane) return state

      const tabIds = pane.tabIds.filter((id) => id !== pageId)
      const activeTabId = pane.activeTabId === pageId ? tabIds[tabIds.length - 1] ?? null : pane.activeTabId

      const workspace: WorkspaceState = {
        ...state.workspace,
        panes: {
          ...state.workspace.panes,
          [paneId]: {
            ...pane,
            tabIds,
            activeTabId,
            view: tabIds.length === 0 ? 'page' : pane.view,
          },
        },
      }

      return {
        workspace,
        ...syncDerivedActiveState({ workspace, pageCache: state.pageCache }),
      }
    })

    get().persistWorkspaceState()
  },

  activateTab: async (paneId, pageId) => {
    const page = await window.api.getPage(pageId)

    set((state) => {
      const pane = state.workspace.panes[paneId]
      if (!pane) return state

      const tabIds = pane.tabIds.includes(pageId) ? pane.tabIds : [...pane.tabIds, pageId]

      const workspace: WorkspaceState = {
        ...state.workspace,
        activePaneId: paneId,
        panes: {
          ...state.workspace.panes,
          [paneId]: {
            ...pane,
            tabIds,
            activeTabId: pageId,
            view: 'page',
          },
        },
      }

      const pageCache = {
        ...state.pageCache,
        [pageId]: page,
      }

      return {
        workspace,
        pageCache,
        ...syncDerivedActiveState({ workspace, pageCache }),
      }
    })

    get().persistWorkspaceState()
  },

  splitActivePane: async () => {
    set((state) => {
      if (state.workspace.layout === 'vertical-split' && state.workspace.panes[SECONDARY_PANE_ID]) {
        return state
      }

      const primaryPane = state.workspace.panes[PRIMARY_PANE_ID] ?? state.workspace.panes[state.workspace.activePaneId]
      if (!primaryPane) return state

      const secondTab = primaryPane.tabIds[1] ?? null
      const secondaryPane: WorkspacePane = {
        id: SECONDARY_PANE_ID,
        tabIds: secondTab ? [secondTab] : [],
        activeTabId: secondTab,
        view: 'page',
      }

      const nextPrimaryTabs = secondTab ? primaryPane.tabIds.filter((id) => id !== secondTab) : primaryPane.tabIds

      const workspace: WorkspaceState = {
        ...state.workspace,
        layout: 'vertical-split',
        activePaneId: SECONDARY_PANE_ID,
        panes: {
          ...state.workspace.panes,
          [PRIMARY_PANE_ID]: {
            ...primaryPane,
            tabIds: nextPrimaryTabs,
            activeTabId: nextPrimaryTabs.includes(primaryPane.activeTabId || '')
              ? primaryPane.activeTabId
              : nextPrimaryTabs[0] ?? null,
          },
          [SECONDARY_PANE_ID]: secondaryPane,
        },
      }

      return {
        workspace,
        ...syncDerivedActiveState({ workspace, pageCache: state.pageCache }),
      }
    })

    get().persistWorkspaceState()
  },

  closePane: async (paneId) => {
    if (paneId !== SECONDARY_PANE_ID) return

    set((state) => {
      const secondaryPane = state.workspace.panes[SECONDARY_PANE_ID]
      const primaryPane = state.workspace.panes[PRIMARY_PANE_ID]
      if (!secondaryPane || !primaryPane) return state

      const mergedTabIds = [...primaryPane.tabIds]
      for (const tabId of secondaryPane.tabIds) {
        if (!mergedTabIds.includes(tabId)) mergedTabIds.push(tabId)
      }

      const workspace: WorkspaceState = {
        ...state.workspace,
        layout: 'single',
        activePaneId: PRIMARY_PANE_ID,
        panes: {
          [PRIMARY_PANE_ID]: {
            ...primaryPane,
            tabIds: mergedTabIds,
            activeTabId: primaryPane.activeTabId ?? secondaryPane.activeTabId ?? mergedTabIds[0] ?? null,
            view: primaryPane.view,
          },
        },
      }

      return {
        workspace,
        ...syncDerivedActiveState({ workspace, pageCache: state.pageCache }),
      }
    })

    get().persistWorkspaceState()
  },

  focusPane: (paneId) => {
    set((state) => {
      if (!state.workspace.panes[paneId]) return state

      const workspace: WorkspaceState = {
        ...state.workspace,
        activePaneId: paneId,
      }

      return {
        workspace,
        ...syncDerivedActiveState({ workspace, pageCache: state.pageCache }),
      }
    })

    get().persistWorkspaceState()
  },

  setSplitRatio: (ratio) => {
    set((state) => ({
      workspace: {
        ...state.workspace,
        splitRatio: clampSplitRatio(ratio),
      },
    }))

    get().persistWorkspaceState()
  },

  toggleSplitView: async () => {
    if (get().workspace.layout === 'vertical-split') {
      await get().closePane(SECONDARY_PANE_ID)
      return
    }

    await get().splitActivePane()
  },

  createPage: async (parentId) => {
    const page = await window.api.createPage({ parentId })
    if (parentId) {
      set((state) => {
        const next = new Set(state.expandedIds)
        next.add(parentId)
        return { expandedIds: next }
      })
    }

    await get().loadPages()
    await get().openPageInActivePane(page.id)
    return page.id
  },

  updatePage: async (id, data) => {
    const updated = await window.api.updatePage(id, data)
    set((state) => ({
      pageCache: {
        ...state.pageCache,
        [id]: updated,
      },
      activePage: state.activePageId === id ? updated : state.activePage,
    }))
    await get().loadPages()
  },

  trashPage: async (id) => {
    await window.api.trashPage(id)

    set((state) => {
      const panes = Object.fromEntries(
        Object.entries(state.workspace.panes).map(([paneId, pane]) => {
          const tabIds = pane.tabIds.filter((tabId) => tabId !== id)
          const activeTabId = pane.activeTabId === id ? tabIds[tabIds.length - 1] ?? null : pane.activeTabId

          return [
            paneId,
            {
              ...pane,
              tabIds,
              activeTabId,
            },
          ]
        })
      ) as WorkspaceState['panes']

      const workspace: WorkspaceState = {
        ...state.workspace,
        panes,
      }

      const nextCache = { ...state.pageCache }
      delete nextCache[id]

      return {
        workspace,
        pageCache: nextCache,
        ...syncDerivedActiveState({ workspace, pageCache: nextCache }),
      }
    })

    await get().loadPages()
    get().persistWorkspaceState()
  },

  restorePage: async (id) => {
    await window.api.restorePage(id)
    await get().loadPages()
  },

  deletePage: async (id) => {
    await window.api.deletePage(id)

    set((state) => {
      const panes = Object.fromEntries(
        Object.entries(state.workspace.panes).map(([paneId, pane]) => {
          const tabIds = pane.tabIds.filter((tabId) => tabId !== id)
          const activeTabId = pane.activeTabId === id ? tabIds[tabIds.length - 1] ?? null : pane.activeTabId

          return [
            paneId,
            {
              ...pane,
              tabIds,
              activeTabId,
            },
          ]
        })
      ) as WorkspaceState['panes']

      const workspace: WorkspaceState = {
        ...state.workspace,
        panes,
      }

      const pageCache = { ...state.pageCache }
      delete pageCache[id]

      return {
        workspace,
        pageCache,
        ...syncDerivedActiveState({ workspace, pageCache }),
      }
    })

    await get().loadPages()
    get().persistWorkspaceState()
  },

  reorderSiblingPages: async (_parentId, orderedIds) => {
    await Promise.all(orderedIds.map((id, index) => window.api.reorderPage(id, index)))
    await get().loadPages()
  },
}))
