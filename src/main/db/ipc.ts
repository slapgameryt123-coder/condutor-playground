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
}
