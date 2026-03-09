import { type ReactNode, useEffect, useMemo } from 'react'
import { PageHeader } from './PageHeader/PageHeader'
import { Breadcrumbs } from './PageHeader/Breadcrumbs'
import { Editor } from './Editor/Editor'
import { TrashView } from './TrashView'
import { isTrashPageId, usePagesStore } from '../store/pagesStore'

function isTypingTarget(target: EventTarget | null): boolean {
  const element = target as HTMLElement | null
  if (!element) return false

  const tagName = element.tagName
  return (
    element.isContentEditable ||
    tagName === 'INPUT' ||
    tagName === 'TEXTAREA' ||
    tagName === 'SELECT' ||
    element.closest('[contenteditable="true"]') !== null
  )
}

function PageTopBar({
  sidebarOpen,
  setSidebarOpen,
  children,
}: {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  children?: ReactNode
}) {
  return (
    <div className="sticky top-0 flex items-center gap-2 px-4 py-1 bg-white/80 backdrop-blur-sm z-10">
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-1.5 rounded hover:bg-notion-sidebar-hover text-notion-text-secondary"
          title="Open sidebar"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 4H14M2 8H14M2 12H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      )}
      {children}
    </div>
  )
}

export function PageView() {
  const {
    activePage,
    activePageId,
    sidebarOpen,
    setSidebarOpen,
    createPage,
    trashPage,
    setSearchQuery,
    runSearch,
  } = usePagesStore()

  const trashSelected = isTrashPageId(activePageId)
  const canTrashActivePage = useMemo(() => Boolean(activePageId && !trashSelected), [activePageId, trashSelected])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const modifier = event.metaKey || event.ctrlKey
      if (!modifier) return

      if (event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setSearchQuery('')
        runSearch('')

        requestAnimationFrame(() => {
          const input = document.getElementById('sidebar-search-input') as HTMLInputElement | null
          input?.focus()
        })
        return
      }

      if (event.key.toLowerCase() === 'n' && !isTypingTarget(event.target)) {
        event.preventDefault()
        void createPage()
        return
      }

      if (event.shiftKey && event.key === 'Backspace' && canTrashActivePage && activePageId && !isTypingTarget(event.target)) {
        event.preventDefault()
        void trashPage(activePageId)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [activePageId, canTrashActivePage, createPage, runSearch, setSearchQuery, trashPage])

  if (trashSelected) {
    return (
      <div className="flex-1 overflow-y-auto">
        <PageTopBar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
          <div className="px-24 text-sm text-notion-text-secondary">Trash</div>
        </PageTopBar>
        <TrashView />
      </div>
    )
  }

  if (!activePage) {
    return (
      <div className="flex-1 flex items-center justify-center text-notion-text-secondary">
        <div className="text-center">
          <div className="text-6xl mb-4">📝</div>
          <h2 className="text-xl font-medium mb-2">No page selected</h2>
          <p className="text-sm">Select a page from the sidebar or create a new one</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <PageTopBar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
        <Breadcrumbs />
      </PageTopBar>

      <PageHeader />
      <Editor />
    </div>
  )
}
