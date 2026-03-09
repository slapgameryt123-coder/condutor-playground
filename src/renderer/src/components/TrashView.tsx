import { useState, useEffect } from 'react'
import { usePagesStore, type PageListItem } from '../store/pagesStore'

export function TrashView() {
  const { pages, restorePage, deletePage, selectPage } = usePagesStore()
  const [trashItems, setTrashItems] = useState<PageListItem[]>([])

  const loadTrash = async () => {
    const items = await window.api.listTrash()
    setTrashItems(items)
  }

  useEffect(() => {
    void loadTrash()
  }, [pages])

  return (
    <div className="px-24 pt-12 pb-16">
      <h1 className="text-2xl font-bold mb-6 text-notion-text">Trash</h1>

      {trashItems.length === 0 ? (
        <div className="text-center text-notion-text-secondary py-12">
          <div className="text-4xl mb-3">🗑️</div>
          <p>Trash is empty</p>
        </div>
      ) : (
        <div className="space-y-1">
          {trashItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-notion-sidebar-hover group"
            >
              <div className="flex items-center gap-2">
                <span>{item.emoji}</span>
                <span className="text-sm">{item.title || 'Untitled'}</span>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={async () => {
                    await restorePage(item.id)
                    await selectPage(item.id)
                    loadTrash()
                  }}
                  className="px-2 py-1 text-xs rounded bg-notion-accent text-white hover:bg-notion-accent-hover"
                >
                  Restore
                </button>
                <button
                  onClick={async () => {
                    await deletePage(item.id)
                    loadTrash()
                  }}
                  className="px-2 py-1 text-xs rounded bg-notion-red text-white hover:opacity-80"
                >
                  Delete forever
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
