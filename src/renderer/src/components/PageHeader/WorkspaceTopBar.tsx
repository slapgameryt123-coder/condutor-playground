import type { ReactNode } from 'react'

type WorkspaceTopBarProps = {
  sidebarOpen: boolean
  onOpenSidebar: () => void
  children?: ReactNode
}

export function WorkspaceTopBar({ sidebarOpen, onOpenSidebar, children }: WorkspaceTopBarProps) {
  return (
    <div className="workspace-topbar">
      <div className="workspace-topbar-content">
        {!sidebarOpen && (
          <button
            type="button"
            onClick={onOpenSidebar}
            className="workspace-topbar-toggle"
            title="Open sidebar"
            aria-label="Open sidebar"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M2 4H14M2 8H14M2 12H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        )}
        {children}
      </div>
    </div>
  )
}
