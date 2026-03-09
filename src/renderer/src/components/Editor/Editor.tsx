import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { BlockNoteEditor, PartialBlock } from '@blocknote/core'
import { filterSuggestionItems } from '@blocknote/core/extensions'
import { BlockNoteView } from '@blocknote/mantine'
import {
  DefaultReactSuggestionItem,
  SuggestionMenuController,
  SuggestionMenuProps,
  getDefaultReactSlashMenuItems,
  useCreateBlockNote,
} from '@blocknote/react'
import { usePagesStore } from '../../store/pagesStore'

function getPreviewLines(item: DefaultReactSuggestionItem): string[] {
  const title = item.title.toLowerCase()

  if (title.includes('heading')) {
    return ['Project plan', 'Scope and milestones']
  }
  if (title.includes('bullet')) {
    return ['• Clarify goals', '• Share timeline', '• Track progress']
  }
  if (title.includes('numbered')) {
    return ['1. Draft', '2. Review', '3. Publish']
  }
  if (title.includes('check')) {
    return ['☐ Kickoff call', '☑ Define requirements', '☐ Ship v1']
  }
  if (title.includes('quote')) {
    return ['“Make it work, then make it right.”']
  }
  if (title.includes('code')) {
    return ['const ready = true', 'if (ready) deploy()']
  }
  if (title.includes('table')) {
    return ['Task | Owner | Status', 'Design | Maya | Done']
  }
  if (title.includes('divider')) {
    return ['────────────']
  }

  return ['Start writing here…']
}

function BlocksMenuWithPreview({
  items,
  loadingState,
  selectedIndex,
  onItemClick,
}: SuggestionMenuProps<DefaultReactSuggestionItem>) {
  const [hoveredIndex, setHoveredIndex] = useState<number | undefined>(selectedIndex)

  useEffect(() => {
    setHoveredIndex(selectedIndex)
  }, [selectedIndex])

  if (loadingState === 'loading' || loadingState === 'loading-initial') {
    return <div className="notion-blocks-menu-loading">Loading blocks…</div>
  }

  if (items.length === 0) {
    return <div className="notion-blocks-menu-loading">No matching blocks</div>
  }

  const activeIndex = hoveredIndex ?? selectedIndex ?? 0
  const activeItem = items[activeIndex] ?? items[0]

  return (
    <div className="bn-suggestion-menu notion-blocks-menu" id="bn-suggestion-menu">
      <div className="notion-blocks-menu-list">
        {items.map((item, index) => (
          <button
            key={`${item.title}-${index}`}
            id={`bn-suggestion-menu-item-${index}`}
            onClick={() => onItemClick?.(item)}
            onMouseEnter={() => setHoveredIndex(index)}
            className={`notion-blocks-menu-item ${index === selectedIndex ? 'is-selected' : ''}`}
          >
            <span className="notion-blocks-menu-icon">{item.icon}</span>
            <span className="notion-blocks-menu-copy">
              <span className="notion-blocks-menu-title">{item.title}</span>
              {item.subtext && <span className="notion-blocks-menu-subtext">{item.subtext}</span>}
            </span>
          </button>
        ))}
      </div>

      <div className="notion-blocks-menu-preview-wrap">
        <div className="notion-blocks-menu-preview-title">Preview</div>
        <div className="notion-block-preview-card">
          <div className="notion-block-preview-label">{activeItem.title}</div>
          <div className="notion-block-preview-content">
            {getPreviewLines(activeItem).map((line, i) => (
              <div key={`${line}-${i}`}>{line}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function Editor() {
  const { activePage, updatePage } = usePagesStore()
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout>>()
  const pageIdRef = useRef<string | null>(null)

  const initialContent = useMemo((): PartialBlock[] | undefined => {
    if (!activePage?.content) return undefined
    try {
      const parsed = JSON.parse(activePage.content)
      return parsed.length > 0 ? parsed : undefined
    } catch {
      return undefined
    }
  }, [activePage?.id])

  const editor = useCreateBlockNote(
    {
      initialContent,
    },
    [activePage?.id]
  )

  const slashMenuItems = useMemo(() => getDefaultReactSlashMenuItems(editor), [editor])

  useEffect(() => {
    pageIdRef.current = activePage?.id ?? null
  }, [activePage?.id])

  const handleChange = useCallback(() => {
    const currentPageId = pageIdRef.current
    if (!currentPageId) return

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    saveTimeoutRef.current = setTimeout(() => {
      const content = JSON.stringify(editor.document)
      updatePage(currentPageId, { content })
    }, 500)
  }, [editor, updatePage])

  if (!activePage) return null

  return (
    <div className="px-24 pb-16">
      <BlockNoteView editor={editor} onChange={handleChange} theme="light" slashMenu={false}>
        <SuggestionMenuController
          triggerCharacter="/"
          getItems={async (query) => filterSuggestionItems(slashMenuItems, query)}
          suggestionMenuComponent={BlocksMenuWithPreview}
        />
      </BlockNoteView>
    </div>
  )
}
