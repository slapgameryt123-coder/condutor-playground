import type { WorkspacePane } from '../../store/pagesStore'

type WorkspaceTab = {
  id: string
  title: string
}

type WorkspaceTabBarProps = {
  pane: WorkspacePane
  tabs: WorkspaceTab[]
  isFocused: boolean
  onFocusPane: () => void
  onActivateTab: (tabId: string) => void
  onCloseTab: (tabId: string) => void
  onCreateTab: () => void
  onSplitPane: () => void
  onClosePane: () => void
}

export function WorkspaceTabBar({
  pane,
  tabs,
  isFocused,
  onFocusPane,
  onActivateTab,
  onCloseTab,
  onCreateTab,
  onSplitPane,
  onClosePane,
}: WorkspaceTabBarProps) {
  return (
    <div className={`workspace-tabbar ${isFocused ? 'is-focused' : ''}`} onMouseDown={onFocusPane}>
      <div className="workspace-tab-items">
        {tabs.map((tab) => {
          const isActive = pane.activeTabId === tab.id

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onActivateTab(tab.id)}
              className={`workspace-tab ${isActive ? 'is-active' : ''}`}
              title={tab.title || 'Untitled'}
            >
              <span className="workspace-tab-emoji">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M4 1h5.586L13 4.414V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1z" stroke="currentColor" strokeWidth="1.2" fill="none" />
                  <path d="M9 1v4h4" stroke="currentColor" strokeWidth="1.2" fill="none" />
                </svg>
              </span>
              <span className="workspace-tab-title">{tab.title || 'Untitled'}</span>
              <span
                role="button"
                aria-label="Close tab"
                className="workspace-tab-close"
                onClick={(event) => {
                  event.stopPropagation()
                  onCloseTab(tab.id)
                }}
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                  <path d="M1 1l8 8M9 1l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </span>
            </button>
          )
        })}
      </div>

      <div className="workspace-tab-actions">
        <button type="button" className="workspace-tab-action" title="New page tab" onClick={onCreateTab}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
        <button type="button" className="workspace-tab-action" title="Split view" onClick={onSplitPane}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <rect x="1.5" y="2.5" width="13" height="11" rx="1" stroke="currentColor" strokeWidth="1.2" />
            <line x1="8" y1="2.5" x2="8" y2="13.5" stroke="currentColor" strokeWidth="1.2" />
          </svg>
        </button>
        {pane.id === 'pane-secondary' && (
          <button type="button" className="workspace-tab-action" title="Close pane" onClick={onClosePane}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}
