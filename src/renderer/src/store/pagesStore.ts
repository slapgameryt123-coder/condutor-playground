import { create } from 'zustand'
import type { PageData } from '../../../preload/index'

export const TRASH_PAGE_ID = '__trash__'

export function isTrashPageId(id: string | null): id is typeof TRASH_PAGE_ID {
  return id === TRASH_PAGE_ID
}

export type PageListItem = {
  id: string
  title: string
  emoji: string
  parent_id: string | null
  sort_order: number
  is_trashed: number
  created_at: string
  updated_at: string
}

interface PagesState {
  pages: PageListItem[]
  activePage: PageData | null
  activePageId: string | null
  sidebarOpen: boolean
  searchQuery: string
  searchResults: PageListItem[]
  expandedIds: Set<string>

  setSidebarOpen: (open: boolean) => void
  setSearchQuery: (query: string) => void
  runSearch: (query: string) => Promise<void>
  setSearchResults: (results: PageListItem[]) => void
  toggleExpanded: (id: string) => void

  loadPages: () => Promise<void>
  selectPage: (id: string) => Promise<void>
  selectTrash: () => void
  createPage: (parentId?: string) => Promise<string>
  updatePage: (id: string, data: Partial<Pick<PageData, 'title' | 'emoji' | 'content'>>) => Promise<void>
  trashPage: (id: string) => Promise<void>
  restorePage: (id: string) => Promise<void>
  deletePage: (id: string) => Promise<void>
  reorderSiblingPages: (parentId: string | null, orderedIds: string[]) => Promise<void>
}

export const usePagesStore = create<PagesState>((set, get) => ({
  pages: [],
  activePage: null,
  activePageId: null,
  sidebarOpen: true,
  searchQuery: '',
  searchResults: [],
  expandedIds: new Set<string>(),

  setSidebarOpen: (open) => set({ sidebarOpen: open }),
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
    set({ pages })
  },

  selectPage: async (id) => {
    set({ activePageId: id, activePage: null })
    const page = await window.api.getPage(id)
    if (get().activePageId === id) {
      set({ activePage: page })
    }
  },

  selectTrash: () => {
    set({ activePageId: TRASH_PAGE_ID, activePage: null })
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
    await get().selectPage(page.id)
    return page.id
  },

  updatePage: async (id, data) => {
    const updated = await window.api.updatePage(id, data)
    if (get().activePageId === id) {
      set({ activePage: updated })
    }
    await get().loadPages()
  },

  trashPage: async (id) => {
    await window.api.trashPage(id)
    if (get().activePageId === id) {
      set({ activePage: null, activePageId: null })
    }
    await get().loadPages()
  },

  restorePage: async (id) => {
    await window.api.restorePage(id)
    await get().loadPages()
  },

  deletePage: async (id) => {
    await window.api.deletePage(id)
    if (get().activePageId === id) {
      set({ activePage: null, activePageId: null })
    }
    await get().loadPages()
  },

  reorderSiblingPages: async (_parentId, orderedIds) => {
    await Promise.all(orderedIds.map((id, index) => window.api.reorderPage(id, index)))
    await get().loadPages()
  },
}))
