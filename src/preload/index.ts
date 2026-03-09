import { contextBridge, ipcRenderer } from 'electron'

export interface PageData {
  id: string
  title: string
  emoji: string
  content: string
  parent_id: string | null
  sort_order: number
  is_trashed: boolean
  created_at: string
  updated_at: string
}

export interface PageListItem {
  id: string
  title: string
  emoji: string
  parent_id: string | null
  sort_order: number
  is_trashed: boolean
  created_at: string
  updated_at: string
}

export type CollectionKind = 'table' | 'gallery'

export interface CollectionData {
  id: string
  name: string
  icon: string
  kind: CollectionKind
  parent_page_id: string | null
  is_trashed: boolean
  created_at: string
  updated_at: string
}

export interface CollectionViewData {
  id: string
  collection_id: string
  name: string
  type: CollectionKind
  created_at: string
  updated_at: string
}

export interface CollectionEntryData {
  id: string
  collection_id: string
  properties: {
    title: string
    description: string
    status: string
  }
  is_trashed: boolean
  created_at: string
  updated_at: string
}

export interface WorkspacePaneSnapshot {
  id: string
  tabIds: string[]
  activeTabId: string | null
  view: 'page' | 'trash'
}

export interface WorkspaceStateSnapshot {
  layout: 'single' | 'vertical-split'
  splitRatio: number
  activePaneId: string
  panes: WorkspacePaneSnapshot[]
  sidebarOpen?: boolean
}

const api = {
  listPages: (): Promise<PageListItem[]> => ipcRenderer.invoke('pages:list'),
  getPage: (id: string): Promise<PageData> => ipcRenderer.invoke('pages:get', id),
  createPage: (data: { parentId?: string; title?: string }): Promise<PageData> =>
    ipcRenderer.invoke('pages:create', data),
  updatePage: (
    id: string,
    data: Partial<Pick<PageData, 'title' | 'emoji' | 'content' | 'parent_id'>>
  ): Promise<PageData> => ipcRenderer.invoke('pages:update', id, data),
  trashPage: (id: string): Promise<void> => ipcRenderer.invoke('pages:trash', id),
  restorePage: (id: string): Promise<void> => ipcRenderer.invoke('pages:restore', id),
  deletePage: (id: string): Promise<void> => ipcRenderer.invoke('pages:delete', id),
  listTrash: (): Promise<PageListItem[]> => ipcRenderer.invoke('pages:trash-list'),
  searchPages: (query: string): Promise<PageListItem[]> => ipcRenderer.invoke('pages:search', query),
  reorderPage: (id: string, newOrder: number): Promise<void> =>
    ipcRenderer.invoke('pages:reorder', id, newOrder),

  listCollections: (): Promise<CollectionData[]> => ipcRenderer.invoke('collections:list'),
  getCollection: (id: string): Promise<CollectionData | undefined> => ipcRenderer.invoke('collections:get', id),
  createCollection: (data: {
    name: string
    kind: CollectionKind
    parent_page_id?: string | null
    icon?: string
  }): Promise<CollectionData> => ipcRenderer.invoke('collections:create', data),
  updateCollection: (
    id: string,
    data: Partial<Pick<CollectionData, 'name' | 'icon' | 'kind' | 'parent_page_id'>>
  ): Promise<CollectionData | undefined> => ipcRenderer.invoke('collections:update', id, data),
  deleteCollection: (id: string): Promise<void> => ipcRenderer.invoke('collections:delete', id),

  listCollectionViews: (collectionId: string): Promise<CollectionViewData[]> =>
    ipcRenderer.invoke('collections:views:list', collectionId),
  createCollectionView: (data: {
    collection_id: string
    name: string
    type: CollectionKind
  }): Promise<CollectionViewData | undefined> => ipcRenderer.invoke('collections:views:create', data),
  updateCollectionView: (
    id: string,
    data: Partial<Pick<CollectionViewData, 'name' | 'type'>>
  ): Promise<CollectionViewData | undefined> => ipcRenderer.invoke('collections:views:update', id, data),
  deleteCollectionView: (id: string): Promise<void> => ipcRenderer.invoke('collections:views:delete', id),

  listCollectionEntries: (collectionId: string): Promise<CollectionEntryData[]> =>
    ipcRenderer.invoke('collections:entries:list', collectionId),
  createCollectionEntry: (data: {
    collection_id: string
    properties?: { title?: string; description?: string; status?: string }
  }): Promise<CollectionEntryData | undefined> => ipcRenderer.invoke('collections:entries:create', data),
  updateCollectionEntry: (
    id: string,
    data: { properties?: { title?: string; description?: string; status?: string } }
  ): Promise<CollectionEntryData | undefined> => ipcRenderer.invoke('collections:entries:update', id, data),
  deleteCollectionEntry: (id: string): Promise<void> => ipcRenderer.invoke('collections:entries:delete', id),

  getWorkspaceState: (): Promise<WorkspaceStateSnapshot | null> => ipcRenderer.invoke('workspace:get'),
  setWorkspaceState: (state: WorkspaceStateSnapshot): Promise<void> => ipcRenderer.invoke('workspace:set', state),
}

export type Api = typeof api

contextBridge.exposeInMainWorld('api', api)
