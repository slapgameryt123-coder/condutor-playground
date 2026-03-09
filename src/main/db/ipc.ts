import { ipcMain } from 'electron'
import { randomUUID } from 'crypto'
import {
  getAllPages,
  getPage,
  createPage,
  updatePage,
  trashPage,
  restorePage,
  deletePage,
  getTrashedPages,
  searchPages,
  reorderPage,
  getWorkspaceState,
  setWorkspaceState,
  getAllCollections,
  getCollection,
  createCollection,
  updateCollection,
  deleteCollection,
  getCollectionEntries,
  createCollectionEntry,
  updateCollectionEntry,
  deleteCollectionEntry,
  getCollectionViews,
  createCollectionView,
  updateCollectionView,
  deleteCollectionView,
  type WorkspaceStateSnapshot,
  type CollectionKind,
} from './index'

export function registerIpcHandlers(): void {
  ipcMain.handle('pages:list', () => {
    return getAllPages()
  })

  ipcMain.handle('pages:get', (_event, id: string) => {
    return getPage(id)
  })

  ipcMain.handle('pages:create', (_event, data: { parentId?: string; title?: string }) => {
    const id = randomUUID()
    return createPage(id, data.parentId ?? null, data.title ?? 'Untitled')
  })

  ipcMain.handle('pages:update', (_event, id: string, data: Partial<{ title: string; emoji: string; content: string; parent_id: string | null }>) => {
    return updatePage(id, data)
  })

  ipcMain.handle('pages:trash', (_event, id: string) => {
    trashPage(id)
  })

  ipcMain.handle('pages:restore', (_event, id: string) => {
    restorePage(id)
  })

  ipcMain.handle('pages:delete', (_event, id: string) => {
    deletePage(id)
  })

  ipcMain.handle('pages:trash-list', () => {
    return getTrashedPages()
  })

  ipcMain.handle('pages:search', (_event, query: string) => {
    return searchPages(query)
  })

  ipcMain.handle('pages:reorder', (_event, id: string, newOrder: number) => {
    reorderPage(id, newOrder)
  })

  ipcMain.handle('collections:list', () => {
    return getAllCollections()
  })

  ipcMain.handle('collections:get', (_event, id: string) => {
    return getCollection(id)
  })

  ipcMain.handle(
    'collections:create',
    (_event, data: { name: string; kind: CollectionKind; parent_page_id?: string | null; icon?: string }) => {
      const id = randomUUID()
      return createCollection(id, {
        name: data.name,
        kind: data.kind,
        parent_page_id: data.parent_page_id ?? null,
        icon: data.icon,
      })
    }
  )

  ipcMain.handle(
    'collections:update',
    (
      _event,
      id: string,
      data: Partial<{ name: string; kind: CollectionKind; parent_page_id: string | null; icon: string }>
    ) => {
      return updateCollection(id, data)
    }
  )

  ipcMain.handle('collections:delete', (_event, id: string) => {
    deleteCollection(id)
  })

  ipcMain.handle('collections:views:list', (_event, collectionId: string) => {
    return getCollectionViews(collectionId)
  })

  ipcMain.handle(
    'collections:views:create',
    (_event, data: { collection_id: string; name: string; type: CollectionKind }) => {
      const id = randomUUID()
      return createCollectionView(id, data)
    }
  )

  ipcMain.handle(
    'collections:views:update',
    (_event, id: string, data: Partial<{ name: string; type: CollectionKind }>) => {
      return updateCollectionView(id, data)
    }
  )

  ipcMain.handle('collections:views:delete', (_event, id: string) => {
    deleteCollectionView(id)
  })

  ipcMain.handle('collections:entries:list', (_event, collectionId: string) => {
    return getCollectionEntries(collectionId)
  })

  ipcMain.handle(
    'collections:entries:create',
    (
      _event,
      data: {
        collection_id: string
        properties?: { title?: string; description?: string; status?: string }
      }
    ) => {
      const id = randomUUID()
      return createCollectionEntry(id, data)
    }
  )

  ipcMain.handle(
    'collections:entries:update',
    (
      _event,
      id: string,
      data: {
        properties?: { title?: string; description?: string; status?: string }
      }
    ) => {
      return updateCollectionEntry(id, data)
    }
  )

  ipcMain.handle('collections:entries:delete', (_event, id: string) => {
    deleteCollectionEntry(id)
  })

  ipcMain.handle('workspace:get', () => {
    return getWorkspaceState()
  })

  ipcMain.handle('workspace:set', (_event, data: WorkspaceStateSnapshot) => {
    setWorkspaceState(data)
  })
}
