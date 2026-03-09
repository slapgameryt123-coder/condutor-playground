import { useState, useEffect, useMemo, useRef } from 'react'
import { TRASH_PAGE_ID, usePagesStore, type PageListItem } from '../../store/pagesStore'

type ContextMenuState = {
  page: PageListItem
  x: number
  y: number
}

export function Sidebar() {
  const {
    pages,
    sidebarOpen,
    setSidebarOpen,
    activePageId,
    createPage,
    selectPage,
    openPageInNewTab,
    splitActivePane,
    openPageInActivePane,
    updatePage,
    trashPage,
    searchQuery,
    setSearchQuery,
    runSearch,
    searchResults,
    selectTrash,
    reorderSiblingPages,
  } = usePagesStore()

  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dropTargetId, setDropTargetId] = useState<string | null>(null)
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null)
  const contextMenuRef = useRef<HTMLDivElement>(null)

  const rootPages = useMemo(
    () =>
      pages
        .filter((p) => !p.parent_id)
        .sort((a, b) => a.sort_order - b.sort_order),
    [pages]
  )

  useEffect(() => {
    const timeout = setTimeout(() => {
      void runSearch(searchQuery)
    }, 150)

    return () => clearTimeout(timeout)
  }, [runSearch, searchQuery])

  useEffect(() => {
    try {
      const raw = localStorage.getItem('sidebar:favorites')
      if (!raw) return
      const ids = JSON.parse(raw) as string[]
      setFavoriteIds(new Set(ids))
    } catch {
      setFavoriteIds(new Set())
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('sidebar:favorites', JSON.stringify(Array.from(favoriteIds)))
  }, [favoriteIds])

  useEffect(() => {
    if (!contextMenu) return

    const handleMouseDown = (event: MouseEvent) => {
      if (contextMenuRef.current?.contains(event.target as Node)) return
      setContextMenu(null)
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setContextMenu(null)
    }

    const handleClose = () => setContextMenu(null)

    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('resize', handleClose)
    window.addEventListener('scroll', handleClose, true)
    document.addEventListener('keydown', handleEscape)

    return () => {
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('resize', handleClose)
      window.removeEventListener('scroll', handleClose, true)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [contextMenu])

  const toggleFavorite = (id: string) => {
    setFavoriteIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleDrop = async (targetPage: PageListItem) => {
    if (!draggingId || draggingId === targetPage.id) return

    const draggedPage = pages.find((p) => p.id === draggingId)
    if (!draggedPage || draggedPage.parent_id !== targetPage.parent_id) return

    const siblings = pages
      .filter((p) => p.parent_id === targetPage.parent_id)
      .sort((a, b) => a.sort_order - b.sort_order)

    const fromIndex = siblings.findIndex((p) => p.id === draggingId)
    const toIndex = siblings.findIndex((p) => p.id === targetPage.id)

    if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return

    const next = [...siblings]
    const [moved] = next.splice(fromIndex, 1)
    next.splice(toIndex, 0, moved)

    await reorderSiblingPages(targetPage.parent_id, next.map((p) => p.id))
  }

  return (
    <aside
      className={`notion-sidebar fixed top-0 left-0 h-full bg-notion-sidebar border-r border-notion-border flex flex-col z-10 ${
        sidebarOpen ? 'is-open translate-x-0' : 'is-closed -translate-x-full'
      }`}
      style={{ width: 240 }}
    >
      {/* Title bar region */}
      <div className="titlebar-drag h-11 flex-shrink-0 flex items-end px-3 pb-0">
        <button
          onClick={() => setSidebarOpen(false)}
          className="titlebar-no-drag p-1 rounded hover:bg-notion-sidebar-hover text-notion-text-secondary opacity-0 hover:opacity-100 transition-opacity"
          title="Close sidebar"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Search */}
      <div className="px-3 py-2">
        <div className="flex items-center gap-1 px-2 py-1.5 rounded-md bg-white/70 border border-notion-border text-sm shadow-[inset_0_0_0_1px_rgba(255,255,255,0.5)]">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-notion-text-secondary flex-shrink-0">
            <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            id="sidebar-search-input"
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent outline-none flex-1 text-notion-text placeholder:text-notion-text-secondary"
          />
        </div>
      </div>

      {/* Search results */}
      {searchQuery.trim() && <SearchResults />}

      {/* Page list */}
      {!searchQuery.trim() && (
        <div className="flex-1 overflow-y-auto px-1 py-1">
          <div className="flex items-center justify-between px-2 py-1 mb-1">
            <span className="text-xs font-medium text-notion-text-secondary uppercase tracking-wider">Pages</span>
            <button
              onClick={() => createPage()}
              className="p-0.5 rounded hover:bg-notion-sidebar-hover text-notion-text-secondary"
              title="New page"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          {rootPages.map((page) => (
            <PageTreeItem
              key={page.id}
              page={page}
              depth={0}
              draggingId={draggingId}
              dropTargetId={dropTargetId}
              setDraggingId={setDraggingId}
              setDropTargetId={setDropTargetId}
              handleDrop={handleDrop}
              favoriteIds={favoriteIds}
              onToggleFavorite={toggleFavorite}
              onOpenContextMenu={(targetPage, x, y) => setContextMenu({ page: targetPage, x, y })}
            />
          ))}
          {rootPages.length === 0 && (
            <button
              onClick={() => createPage()}
              className="w-full text-left px-3 py-2 text-sm text-notion-text-secondary hover:bg-notion-sidebar-hover rounded-md"
            >
              + Add a page
            </button>
          )}
          <button
            onClick={selectTrash}
            className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-colors ${
              activePageId === TRASH_PAGE_ID
              ? 'bg-notion-sidebar-active text-notion-text'
              : 'text-notion-text-secondary hover:bg-notion-sidebar-hover'
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M3 4H13M6 4V3C6 2.5 6.5 2 7 2H9C9.5 2 10 2.5 10 3V4M4 4V13C4 13.5 4.5 14 5 14H11C11.5 14 12 13.5 12 13V4"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
            Trash
          </button>
        </div>
      )}

      {contextMenu && (
        <div
          ref={contextMenuRef}
          className="notion-menu-panel fixed z-50 min-w-[180px] p-1"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onContextMenu={(e) => e.preventDefault()}
        >
          <button
            onClick={() => {
              void selectPage(contextMenu.page.id)
              setContextMenu(null)
            }}
            className="notion-menu-item w-full text-left px-2 py-1.5 text-sm"
          >
            Open page
          </button>
          <button
            onClick={() => {
              void openPageInNewTab(contextMenu.page.id)
              setContextMenu(null)
            }}
            className="notion-menu-item w-full text-left px-2 py-1.5 text-sm"
          >
            Open in new tab
          </button>
          <button
            onClick={() => {
              void splitActivePane().then(() => openPageInActivePane(contextMenu.page.id))
              setContextMenu(null)
            }}
            className="notion-menu-item w-full text-left px-2 py-1.5 text-sm"
          >
            Open in split view
          </button>
          <button
            onClick={() => {
              const nextTitle = window.prompt('Rename page', contextMenu.page.title || 'Untitled')
              if (nextTitle !== null) {
                void updatePage(contextMenu.page.id, { title: nextTitle.trim() || 'Untitled' })
                void selectPage(contextMenu.page.id)
              }
              setContextMenu(null)
            }}
            className="notion-menu-item w-full text-left px-2 py-1.5 text-sm"
          >
            Edit title
          </button>
          <button
            onClick={() => {
              toggleFavorite(contextMenu.page.id)
              setContextMenu(null)
            }}
            className="notion-menu-item w-full text-left px-2 py-1.5 text-sm"
          >
            {favoriteIds.has(contextMenu.page.id) ? 'Remove from favorites' : 'Add to favorites'}
          </button>
          <button
            onClick={() => {
              void trashPage(contextMenu.page.id)
              setContextMenu(null)
            }}
            className="notion-menu-item w-full text-left px-2 py-1.5 text-sm text-red-600"
          >
            Move to trash
          </button>
        </div>
      )}
    </aside>
  )
}

type PageTreeItemProps = {
  page: PageListItem
  depth: number
  draggingId: string | null
  dropTargetId: string | null
  setDraggingId: (id: string | null) => void
  setDropTargetId: (id: string | null) => void
  handleDrop: (targetPage: PageListItem) => Promise<void>
  favoriteIds: Set<string>
  onToggleFavorite: (id: string) => void
  onOpenContextMenu: (page: PageListItem, x: number, y: number) => void
}

function PageTreeItem({
  page,
  depth,
  draggingId,
  dropTargetId,
  setDraggingId,
  setDropTargetId,
  handleDrop,
  favoriteIds,
  onToggleFavorite,
  onOpenContextMenu,
}: PageTreeItemProps) {
  const { pages, activePageId, selectPage, createPage, trashPage, expandedIds, toggleExpanded } = usePagesStore()

  const children = useMemo(
    () =>
      pages
        .filter((p) => p.parent_id === page.id)
        .sort((a, b) => a.sort_order - b.sort_order),
    [pages, page.id]
  )
  const hasChildren = children.length > 0
  const isExpanded = expandedIds.has(page.id)
  const isActive = activePageId === page.id
  const isFavorite = favoriteIds.has(page.id)
  const [showActions, setShowActions] = useState(false)

  return (
    <div>
      <div
        draggable
        className={`group flex items-center gap-0.5 py-1 pr-1 rounded-md cursor-pointer text-sm transition-colors ${
          isActive ? 'bg-notion-sidebar-active text-notion-text' : 'text-notion-text notion-menu-item'
        } ${dropTargetId === page.id && draggingId !== page.id ? 'ring-1 ring-notion-accent' : ''}`}
        style={{ paddingLeft: 8 + depth * 16 }}
        onClick={() => selectPage(page.id)}
        onContextMenu={(event) => {
          event.preventDefault()
          onOpenContextMenu(page, event.clientX, event.clientY)
        }}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
        onDragStart={() => {
          setDraggingId(page.id)
          setDropTargetId(null)
        }}
        onDragOver={(event) => {
          if (!draggingId || draggingId === page.id) return

          const draggedPage = pages.find((p) => p.id === draggingId)
          if (!draggedPage || draggedPage.parent_id !== page.parent_id) return

          event.preventDefault()
          setDropTargetId(page.id)
        }}
        onDrop={async (event) => {
          event.preventDefault()
          await handleDrop(page)
          setDraggingId(null)
          setDropTargetId(null)
        }}
        onDragEnd={() => {
          setDraggingId(null)
          setDropTargetId(null)
        }}
      >
        {/* Expand toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            toggleExpanded(page.id)
          }}
          className={`p-0.5 rounded hover:bg-notion-sidebar-hover flex-shrink-0 transition-transform ${
            isExpanded ? 'rotate-90' : ''
          } ${hasChildren ? 'text-notion-text-secondary' : 'text-transparent'}`}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M4 2L8 6L4 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

        {/* Emoji */}
        <span className="flex-shrink-0 text-sm">{page.emoji}</span>

        {/* Title */}
        <span className="flex-1 truncate ml-1">{page.title || 'Untitled'}</span>
        {isFavorite && <span className="text-yellow-500 text-xs mr-1">★</span>}

        {/* Actions */}
        {showActions && (
          <div className="flex items-center gap-0.5 flex-shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation()
                createPage(page.id)
              }}
              className="p-0.5 rounded hover:bg-notion-sidebar-active text-notion-text-secondary"
              title="Add sub-page"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 2V10M2 6H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onToggleFavorite(page.id)
              }}
              className="p-0.5 rounded hover:bg-notion-sidebar-active text-notion-text-secondary"
              title={isFavorite ? 'Remove favorite' : 'Add favorite'}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M6 1.5L7.4 4.34L10.53 4.8L8.27 7L8.81 10.1L6 8.62L3.19 10.1L3.73 7L1.47 4.8L4.6 4.34L6 1.5Z"
                  stroke="currentColor"
                  fill={isFavorite ? 'currentColor' : 'none'}
                  strokeWidth="1"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                trashPage(page.id)
              }}
              className="p-0.5 rounded hover:bg-notion-sidebar-active text-notion-text-secondary"
              title="Delete"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M2 3H10M4.5 3V2.5C4.5 2 5 1.5 5.5 1.5H6.5C7 1.5 7.5 2 7.5 2.5V3M3 3V10C3 10.5 3.5 11 4 11H8C8.5 11 9 10.5 9 10V3"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Children */}
      {isExpanded && hasChildren && (
        <div>
          {children.map((child) => (
            <PageTreeItem
              key={child.id}
              page={child}
              depth={depth + 1}
              draggingId={draggingId}
              dropTargetId={dropTargetId}
              setDraggingId={setDraggingId}
              setDropTargetId={setDropTargetId}
              handleDrop={handleDrop}
              favoriteIds={favoriteIds}
              onToggleFavorite={onToggleFavorite}
              onOpenContextMenu={onOpenContextMenu}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function SearchResults() {
  const { searchQuery, searchResults, selectPage } = usePagesStore()

  if (!searchQuery.trim()) return null

  return (
    <div className="flex-1 overflow-y-auto px-1 py-1">
      <div className="px-2 py-1 text-xs text-notion-text-secondary">
        {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
      </div>
      {searchResults.map((page) => (
        <button
          key={page.id}
          onClick={() => selectPage(page.id)}
          className="w-full flex items-center gap-2 px-3 py-1.5 text-sm rounded-md notion-menu-item text-left"
        >
          <span>{page.emoji}</span>
          <span className="truncate">{page.title || 'Untitled'}</span>
        </button>
      ))}
      {searchResults.length === 0 && (
        <div className="px-3 py-4 text-sm text-notion-text-secondary text-center">No results</div>
      )}
    </div>
  )
}
