import { useEffect, useMemo, useRef, useState } from 'react'
import { PageHeader } from './PageHeader/PageHeader'
import { Breadcrumbs } from './PageHeader/Breadcrumbs'
import { WorkspaceTopBar } from './PageHeader/WorkspaceTopBar'
import { WorkspaceTabBar } from './PageHeader/WorkspaceTabBar'
import { Editor } from './Editor/Editor'
import { TrashView } from './TrashView'
import { isTrashPageId, type WorkspacePane, usePagesStore } from '../store/pagesStore'

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


function PaneContent({ pane }: { pane: WorkspacePane }) {
  const { sidebarOpen, setSidebarOpen, pageCache } = usePagesStore()

  if (pane.view === 'trash') {
    return (
      <div className="flex-1 overflow-y-auto">
        <WorkspaceTopBar sidebarOpen={sidebarOpen} onOpenSidebar={() => setSidebarOpen(true)}>
          <div className="workspace-topbar-label">Trash</div>
        </WorkspaceTopBar>
        <TrashView />
      </div>
    )
  }

  const page = pane.activeTabId ? pageCache[pane.activeTabId] : null

  if (!pane.activeTabId) {
    return (
      <div className="flex-1 flex items-center justify-center text-notion-text-secondary">
        <div className="text-center">
          <div className="text-6xl mb-4">📝</div>
          <h2 className="text-xl font-medium mb-2">No tab selected</h2>
          <p className="text-sm">Open a page from the sidebar or create a new one</p>
        </div>
      </div>
    )
  }

  if (!page) {
    return (
      <div className="flex-1 flex items-center justify-center text-notion-text-secondary">
        <div className="text-sm">Loading page…</div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <WorkspaceTopBar sidebarOpen={sidebarOpen} onOpenSidebar={() => setSidebarOpen(true)}>
        <Breadcrumbs page={page} />
      </WorkspaceTopBar>

      <PageHeader page={page} />
      <Editor page={page} />
    </div>
  )
}

function PaneView({ pane, isFocused }: { pane: WorkspacePane; isFocused: boolean }) {
  const { pages, focusPane, activateTab, closeTab, createPage, splitActivePane, closePane } = usePagesStore()

  const tabs = useMemo(
    () =>
      pane.tabIds.map((tabId) => {
        const page = pages.find((entry) => entry.id === tabId)
        return {
          id: tabId,
          title: page?.title || 'Untitled',
        }
      }),
    [pane.tabIds, pages]
  )

  return (
    <div className={`workspace-pane ${isFocused ? 'is-focused' : ''}`} onMouseDown={() => focusPane(pane.id)}>
      <WorkspaceTabBar
        pane={pane}
        tabs={tabs}
        isFocused={isFocused}
        onFocusPane={() => focusPane(pane.id)}
        onActivateTab={(tabId) => {
          void activateTab(pane.id, tabId)
        }}
        onCloseTab={(tabId) => {
          void closeTab(pane.id, tabId)
        }}
        onCreateTab={() => {
          focusPane(pane.id)
          void createPage()
        }}
        onSplitPane={() => {
          focusPane(pane.id)
          void splitActivePane()
        }}
        onClosePane={() => {
          void closePane(pane.id)
        }}
      />
      <PaneContent pane={pane} />
    </div>
  )
}

export function PageView() {
  const {
    activePageId,
    createPage,
    trashPage,
    setSearchQuery,
    runSearch,
    workspace,
    setSplitRatio,
    toggleSplitView,
    toggleSidebar,
    closeTab,
    activateTab,
    loadWorkspaceState,
    loadPages,
  } = usePagesStore()

  const splitContainerRef = useRef<HTMLDivElement>(null)
  const [isResizing, setIsResizing] = useState(false)
  const canTrashActivePage = useMemo(
    () => Boolean(activePageId && !isTrashPageId(activePageId)),
    [activePageId]
  )

  useEffect(() => {
    void loadPages()
    void loadWorkspaceState()
  }, [loadPages, loadWorkspaceState])

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

      if (event.key.toLowerCase() === 't' && !isTypingTarget(event.target)) {
        event.preventDefault()
        void createPage()
        return
      }

      if (event.key.toLowerCase() === 'w' && !isTypingTarget(event.target)) {
        event.preventDefault()
        const pane = workspace.panes[workspace.activePaneId]
        if (pane?.activeTabId) {
          void closeTab(pane.id, pane.activeTabId)
        }
        return
      }

      if (event.shiftKey && (event.key === ']' || event.key === '[') && !isTypingTarget(event.target)) {
        event.preventDefault()
        const pane = workspace.panes[workspace.activePaneId]
        if (!pane || pane.tabIds.length < 2 || !pane.activeTabId) return

        const currentIndex = pane.tabIds.indexOf(pane.activeTabId)
        if (currentIndex === -1) return

        const delta = event.key === ']' ? 1 : -1
        const nextIndex = (currentIndex + delta + pane.tabIds.length) % pane.tabIds.length
        void activateTab(pane.id, pane.tabIds[nextIndex])
        return
      }

      if (event.key === '\\' && !isTypingTarget(event.target)) {
        event.preventDefault()
        void toggleSplitView()
        return
      }

      if (event.key.toLowerCase() === 'b' && !isTypingTarget(event.target)) {
        event.preventDefault()
        toggleSidebar()
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
  }, [
    activePageId,
    activateTab,
    canTrashActivePage,
    closeTab,
    createPage,
    runSearch,
    setSearchQuery,
    toggleSplitView,
    toggleSidebar,
    trashPage,
    workspace.activePaneId,
    workspace.panes,
  ])

  useEffect(() => {
    if (!isResizing) return

    const onMove = (event: MouseEvent) => {
      const container = splitContainerRef.current
      if (!container) return
      const rect = container.getBoundingClientRect()
      const ratio = (event.clientX - rect.left) / rect.width
      setSplitRatio(ratio)
    }

    const onUp = () => setIsResizing(false)

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)

    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [isResizing, setSplitRatio])

  const primaryPane = workspace.panes['pane-primary']
  const secondaryPane = workspace.panes['pane-secondary']

  if (!primaryPane) return null

  if (workspace.layout !== 'vertical-split' || !secondaryPane) {
    return <PaneView pane={primaryPane} isFocused={workspace.activePaneId === primaryPane.id} />
  }

  return (
    <div className="workspace-split" ref={splitContainerRef}>
      <div className="workspace-split-pane" style={{ width: `${workspace.splitRatio * 100}%` }}>
        <PaneView pane={primaryPane} isFocused={workspace.activePaneId === primaryPane.id} />
      </div>

      <div className="workspace-split-handle" onMouseDown={() => setIsResizing(true)} />

      <div className="workspace-split-pane" style={{ width: `${(1 - workspace.splitRatio) * 100}%` }}>
        <PaneView pane={secondaryPane} isFocused={workspace.activePaneId === secondaryPane.id} />
      </div>
    </div>
  )
}
