import { contextBridge, ipcRenderer } from 'electron'

export interface PageData {
  id: string
  title: string
  emoji: string
  content: string
  parent_id: string | null
  sort_order: number
  is_trashed: number
  created_at: string
  updated_at: string
}

export interface PageListItem {
  id: string
  title: string
  emoji: string
  parent_id: string | null
  sort_order: number
  is_trashed: number
  created_at: string
  updated_at: string
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
    ipcRenderer.invoke('pages:reorder', id, newOrder)
}

export type Api = typeof api

contextBridge.exposeInMainWorld('api', api)
