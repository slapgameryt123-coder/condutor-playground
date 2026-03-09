import { app } from 'electron'
import { join } from 'path'
import { readFileSync, writeFileSync, existsSync } from 'fs'

const STORE_SCHEMA_VERSION = 2

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

export type CollectionKind = 'table' | 'gallery'

export interface CollectionRecord {
  id: string
  name: string
  icon: string
  kind: CollectionKind
  parent_page_id: string | null
  is_trashed: boolean
  created_at: string
  updated_at: string
}

export interface CollectionViewRecord {
  id: string
  collection_id: string
  name: string
  type: CollectionKind
  created_at: string
  updated_at: string
}

export interface CollectionEntryRecord {
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

interface Store {
  schemaVersion: number
  pages: PageRecord[]
  collections: CollectionRecord[]
  collectionViews: CollectionViewRecord[]
  collectionEntries: CollectionEntryRecord[]
  workspace: WorkspaceStateSnapshot | null
}

let store: Store = {
  schemaVersion: STORE_SCHEMA_VERSION,
  pages: [],
  collections: [],
  collectionViews: [],
  collectionEntries: [],
  workspace: null,
}
let storePath: string

function save(): void {
  writeFileSync(storePath, JSON.stringify(store, null, 2), 'utf-8')
}

function migrate(raw: unknown): Store {
  const next = raw && typeof raw === 'object' ? (raw as Partial<Store>) : {}

  const migrated: Store = {
    schemaVersion: STORE_SCHEMA_VERSION,
    pages: Array.isArray(next.pages) ? next.pages : [],
    collections: Array.isArray(next.collections) ? next.collections : [],
    collectionViews: Array.isArray(next.collectionViews) ? next.collectionViews : [],
    collectionEntries: Array.isArray(next.collectionEntries) ? next.collectionEntries : [],
    workspace: next.workspace ?? null,
  }

  migrated.pages = migrated.pages.map((page) => ({
    ...page,
    is_trashed: Boolean(page.is_trashed),
  }))

  migrated.collections = migrated.collections.map((collection) => ({
    ...collection,
    icon: collection.icon || '🗂️',
    kind: collection.kind === 'gallery' ? 'gallery' : 'table',
    parent_page_id: collection.parent_page_id ?? null,
    is_trashed: Boolean(collection.is_trashed),
  }))

  migrated.collectionViews = migrated.collectionViews
    .filter((view) => typeof view.collection_id === 'string' && view.collection_id.length > 0)
    .map((view) => ({
      ...view,
      type: view.type === 'gallery' ? 'gallery' : 'table',
      name: view.name || 'Default view',
    }))

  migrated.collectionEntries = migrated.collectionEntries
    .filter((entry) => typeof entry.collection_id === 'string' && entry.collection_id.length > 0)
    .map((entry) => ({
      ...entry,
      is_trashed: Boolean(entry.is_trashed),
      properties: {
        title: entry.properties?.title || 'Untitled',
        description: entry.properties?.description || '',
        status: entry.properties?.status || 'Draft',
      },
    }))

  return migrated
}

function load(): void {
  if (existsSync(storePath)) {
    try {
      const parsed = JSON.parse(readFileSync(storePath, 'utf-8'))
      store = migrate(parsed)
    } catch {
      store = migrate(undefined)
    }
  } else {
    store = migrate(undefined)
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

export function getAllCollections(): CollectionRecord[] {
  return store.collections
    .filter((collection) => !collection.is_trashed)
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
}

export function getCollection(id: string): CollectionRecord | undefined {
  return store.collections.find((collection) => collection.id === id && !collection.is_trashed)
}

export function createCollection(
  id: string,
  data: Pick<CollectionRecord, 'name' | 'kind' | 'parent_page_id'> & Partial<Pick<CollectionRecord, 'icon'>>
): CollectionRecord {
  const now = new Date().toISOString()
  const collection: CollectionRecord = {
    id,
    name: data.name.trim() || 'Untitled database',
    icon: data.icon?.trim() || '🗂️',
    kind: data.kind,
    parent_page_id: data.parent_page_id,
    is_trashed: false,
    created_at: now,
    updated_at: now,
  }

  const view: CollectionViewRecord = {
    id: `${id}-default-view`,
    collection_id: id,
    name: data.kind === 'gallery' ? 'Gallery' : 'Table',
    type: data.kind,
    created_at: now,
    updated_at: now,
  }

  store.collections.push(collection)
  store.collectionViews.push(view)
  save()
  return collection
}

export function updateCollection(
  id: string,
  data: Partial<Pick<CollectionRecord, 'name' | 'icon' | 'kind' | 'parent_page_id'>>
): CollectionRecord | undefined {
  const collection = store.collections.find((entry) => entry.id === id)
  if (!collection || collection.is_trashed) return undefined

  if (data.name !== undefined) collection.name = data.name.trim() || 'Untitled database'
  if (data.icon !== undefined) collection.icon = data.icon.trim() || '🗂️'
  if (data.kind !== undefined) collection.kind = data.kind
  if (data.parent_page_id !== undefined) collection.parent_page_id = data.parent_page_id
  collection.updated_at = new Date().toISOString()

  save()
  return collection
}

export function deleteCollection(id: string): void {
  const collection = store.collections.find((entry) => entry.id === id)
  if (!collection) return

  collection.is_trashed = true
  collection.updated_at = new Date().toISOString()
  store.collectionEntries = store.collectionEntries.filter((entry) => entry.collection_id !== id)
  store.collectionViews = store.collectionViews.filter((view) => view.collection_id !== id)
  save()
}

export function getCollectionViews(collectionId: string): CollectionViewRecord[] {
  return store.collectionViews
    .filter((view) => view.collection_id === collectionId)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
}

export function createCollectionView(
  id: string,
  data: Pick<CollectionViewRecord, 'collection_id' | 'name' | 'type'>
): CollectionViewRecord | undefined {
  const collection = getCollection(data.collection_id)
  if (!collection) return undefined

  const now = new Date().toISOString()
  const view: CollectionViewRecord = {
    id,
    collection_id: data.collection_id,
    name: data.name.trim() || 'View',
    type: data.type,
    created_at: now,
    updated_at: now,
  }

  store.collectionViews.push(view)
  collection.updated_at = now
  save()
  return view
}

export function updateCollectionView(
  id: string,
  data: Partial<Pick<CollectionViewRecord, 'name' | 'type'>>
): CollectionViewRecord | undefined {
  const view = store.collectionViews.find((entry) => entry.id === id)
  if (!view) return undefined

  if (data.name !== undefined) view.name = data.name.trim() || 'View'
  if (data.type !== undefined) view.type = data.type
  view.updated_at = new Date().toISOString()

  save()
  return view
}

export function deleteCollectionView(id: string): void {
  store.collectionViews = store.collectionViews.filter((view) => view.id !== id)
  save()
}

export function getCollectionEntries(collectionId: string): CollectionEntryRecord[] {
  return store.collectionEntries
    .filter((entry) => entry.collection_id === collectionId && !entry.is_trashed)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
}

export function createCollectionEntry(
  id: string,
  data: Pick<CollectionEntryRecord, 'collection_id'> &
    Partial<Pick<CollectionEntryRecord, 'properties'>>
): CollectionEntryRecord | undefined {
  const collection = getCollection(data.collection_id)
  if (!collection) return undefined

  const now = new Date().toISOString()
  const entry: CollectionEntryRecord = {
    id,
    collection_id: data.collection_id,
    properties: {
      title: data.properties?.title?.trim() || 'Untitled',
      description: data.properties?.description?.trim() || '',
      status: data.properties?.status?.trim() || 'Draft',
    },
    is_trashed: false,
    created_at: now,
    updated_at: now,
  }

  store.collectionEntries.push(entry)
  collection.updated_at = now
  save()
  return entry
}

export function updateCollectionEntry(
  id: string,
  data: Partial<Pick<CollectionEntryRecord, 'properties'>>
): CollectionEntryRecord | undefined {
  const entry = store.collectionEntries.find((candidate) => candidate.id === id)
  if (!entry || entry.is_trashed) return undefined

  if (data.properties) {
    entry.properties = {
      title: data.properties.title?.trim() || entry.properties.title,
      description:
        data.properties.description !== undefined ? data.properties.description.trim() : entry.properties.description,
      status: data.properties.status?.trim() || entry.properties.status,
    }
  }

  entry.updated_at = new Date().toISOString()
  save()
  return entry
}

export function deleteCollectionEntry(id: string): void {
  const entry = store.collectionEntries.find((candidate) => candidate.id === id)
  if (!entry) return

  entry.is_trashed = true
  entry.updated_at = new Date().toISOString()
  save()
}

export function getWorkspaceState(): WorkspaceStateSnapshot | null {
  return store.workspace
}

export function setWorkspaceState(workspace: WorkspaceStateSnapshot): void {
  store.workspace = workspace
  save()
}
