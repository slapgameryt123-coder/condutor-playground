import { useState, useRef, useEffect, useCallback } from 'react'
import type { PageData } from '../../../../preload'
import { usePagesStore } from '../../store/pagesStore'

const EMOJIS = [
  '📄', '📝', '📋', '📁', '📚', '📖', '📓', '📒', '📑', '🗂️',
  '💡', '🎯', '🚀', '⭐', '🔥', '💎', '🎨', '🎵', '📸', '🎬',
  '🏠', '🏢', '🌍', '🌟', '🌈', '☀️', '🌙', '⚡', '💻', '🔧',
  '📊', '📈', '🗓️', '✅', '❤️', '💬', '🔔', '🎉', '🤝', '👤',
]

export function PageHeader({ page }: { page: PageData | null }) {
  const { updatePage } = usePagesStore()
  const activePage = page
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [titleValue, setTitleValue] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const titleRef = useRef<HTMLInputElement>(null)
  const emojiRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (activePage) setTitleValue(activePage.title)
  }, [activePage?.id, activePage?.title])

  useEffect(() => {
    if (isEditingTitle) titleRef.current?.focus()
  }, [isEditingTitle])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
        setShowEmojiPicker(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const saveTitle = useCallback(() => {
    if (!activePage) return
    setIsEditingTitle(false)
    if (titleValue !== activePage.title) {
      updatePage(activePage.id, { title: titleValue || 'Untitled' })
    }
  }, [activePage, titleValue, updatePage])

  if (!activePage) return null

  return (
    <div className="px-24 pt-12 pb-4">
      {/* Emoji */}
      <div className="relative mb-2" ref={emojiRef}>
        <button
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="text-5xl hover:bg-notion-sidebar-hover rounded-lg p-1 transition-colors"
        >
          {activePage.emoji}
        </button>
        {showEmojiPicker && (
          <div className="notion-menu-panel absolute top-full left-0 mt-1 p-3 grid grid-cols-8 gap-1 z-20">
            {EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  updatePage(activePage.id, { emoji })
                  setShowEmojiPicker(false)
                }}
                className="notion-menu-item text-2xl p-1.5"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Title */}
      {isEditingTitle ? (
        <input
          ref={titleRef}
          value={titleValue}
          onChange={(e) => setTitleValue(e.target.value)}
          onBlur={saveTitle}
          onKeyDown={(e) => {
            if (e.key === 'Enter') saveTitle()
          }}
          placeholder="Untitled"
          className="text-4xl font-bold w-full outline-none bg-transparent text-notion-text placeholder:text-notion-border"
        />
      ) : (
        <h1
          onClick={() => setIsEditingTitle(true)}
          className="text-4xl font-bold cursor-text text-notion-text min-h-[48px]"
        >
          {activePage.title || (
            <span className="text-notion-border">Untitled</span>
          )}
        </h1>
      )}
    </div>
  )
}
