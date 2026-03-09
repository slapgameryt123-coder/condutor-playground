import { app } from 'electron'
import { join } from 'path'
import { readFileSync, writeFileSync, existsSync } from 'fs'

export interface PageRecord {
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

interface Store {
  pages: PageRecord[]
}

let store: Store = { pages: [] }
let storePath: string

function save(): void {
  writeFileSync(storePath, JSON.stringify(store, null, 2), 'utf-8')
}

function load(): void {
  if (existsSync(storePath)) {
    try {
      store = JSON.parse(readFileSync(storePath, 'utf-8'))
    } catch {
      store = { pages: [] }
    }
  }
}

export function initDatabase(): void {
  storePath = join(app.getPath('userData'), 'notion-clone-data.json')
  load()
}

export function getAllPages(): PageRecord[] {
  return store.pages.filter((p) => !p.is_trashed).sort((a, b) => a.sort_order - b.sort_order)
}

export function getPage(id: string): PageRecord | undefined {
  return store.pages.find((p) => p.id === id)
}

export function createPage(id: string, parentId: string | null, title: string): PageRecord {
  const siblings = store.pages.filter((p) => p.parent_id === parentId && !p.is_trashed)
  const maxSort = siblings.length > 0 ? Math.max(...siblings.map((s) => s.sort_order)) + 1 : 0

  const page: PageRecord = {
    id,
    title,
    emoji: '📄',
    content: '[]',
    parent_id: parentId,
    sort_order: maxSort,
    is_trashed: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  store.pages.push(page)
  save()
  return page
}

export function updatePage(id: string, data: Partial<Pick<PageRecord, 'title' | 'emoji' | 'content' | 'parent_id'>>): PageRecord | undefined {
  const page = store.pages.find((p) => p.id === id)
  if (!page) return undefined

  if (data.title !== undefined) page.title = data.title
  if (data.emoji !== undefined) page.emoji = data.emoji
  if (data.content !== undefined) page.content = data.content
  if (data.parent_id !== undefined) page.parent_id = data.parent_id
  page.updated_at = new Date().toISOString()

  save()
  return page
}

export function trashPage(id: string): void {
  const page = store.pages.find((p) => p.id === id)
  if (page) {
    page.is_trashed = true
    page.updated_at = new Date().toISOString()
    save()
  }
}

export function restorePage(id: string): void {
  const page = store.pages.find((p) => p.id === id)
  if (page) {
    page.is_trashed = false
    page.updated_at = new Date().toISOString()
    save()
  }
}

export function deletePage(id: string): void {
  store.pages = store.pages.filter((p) => p.id !== id)
  save()
}

export function getTrashedPages(): PageRecord[] {
  return store.pages.filter((p) => p.is_trashed).sort((a, b) =>
    new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  )
}

export function searchPages(query: string): PageRecord[] {
  const lower = query.toLowerCase()
  return store.pages
    .filter((p) => !p.is_trashed && p.title.toLowerCase().includes(lower))
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 20)
}

export function reorderPage(id: string, newOrder: number): void {
  const page = store.pages.find((p) => p.id === id)
  if (page) {
    page.sort_order = newOrder
    page.updated_at = new Date().toISOString()
    save()
  }
}
