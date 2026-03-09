import { useMemo } from 'react'
import { usePagesStore } from '../../store/pagesStore'

export function Breadcrumbs() {
  const { activePage, pages, selectPage } = usePagesStore()

  const crumbs = useMemo(() => {
    if (!activePage) return []
    const result: { id: string; title: string; emoji: string }[] = []
    let currentId: string | null = activePage.parent_id

    while (currentId) {
      const parent = pages.find((p) => p.id === currentId)
      if (!parent) break
      result.unshift({ id: parent.id, title: parent.title, emoji: parent.emoji })
      currentId = parent.parent_id
    }

    return result
  }, [activePage, pages])

  if (crumbs.length === 0) return null

  return (
    <div className="flex items-center gap-1 px-24 text-sm text-notion-text-secondary">
      {crumbs.map((crumb, i) => (
        <span key={crumb.id} className="flex items-center gap-1">
          {i > 0 && <span className="mx-0.5">/</span>}
          <button
            onClick={() => selectPage(crumb.id)}
            className="notion-menu-item px-1 py-0.5 flex items-center gap-1"
          >
            <span className="text-xs">{crumb.emoji}</span>
            <span className="truncate max-w-[120px]">{crumb.title || 'Untitled'}</span>
          </button>
        </span>
      ))}
    </div>
  )
}
