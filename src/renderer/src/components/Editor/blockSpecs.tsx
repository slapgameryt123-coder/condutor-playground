import { BlockNoteSchema, defaultBlockSpecs } from '@blocknote/core'
import { createReactBlockSpec } from '@blocknote/react'
import { isAllowedCalendarUrl, validateExternalUrl } from './embedSafety'

const toneValues = ['default', 'info', 'warning', 'success'] as const

const CalendarEmbedBlock = createReactBlockSpec(
  {
    type: 'calendarEmbed',
    propSchema: {
      url: { default: '' },
      title: { default: 'Calendar' },
    },
    content: 'none',
  },
  {
    render: ({ block, editor }) => {
      const validation = validateExternalUrl(block.props.url)
      const isAllowed = validation.ok && isAllowedCalendarUrl(block.props.url)

      const handleConfigure = () => {
        const nextTitle = window.prompt('Calendar title', block.props.title) ?? block.props.title
        const nextUrl = window.prompt('Calendar URL', block.props.url) ?? block.props.url

        editor.updateBlock(block, {
          type: 'calendarEmbed',
          props: {
            title: nextTitle.trim() || 'Calendar',
            url: nextUrl.trim(),
          },
        })
      }

      return (
        <div className="custom-block calendar-embed-block" contentEditable={false}>
          <div className="custom-block-header custom-block-header-row">
            <span>{block.props.title}</span>
            <button type="button" className="custom-block-action" onClick={handleConfigure}>
              Configure
            </button>
          </div>

          {isAllowed ? (
            <iframe
              src={validation.normalizedUrl}
              title={block.props.title || 'Calendar embed'}
              className="calendar-embed-iframe"
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
          ) : (
            <div className="custom-block-empty">
              Add a supported HTTPS calendar embed URL (Google Calendar or Calendly).
            </div>
          )}
        </div>
      )
    },
  }
)()

const BookmarkCardBlock = createReactBlockSpec(
  {
    type: 'bookmarkCard',
    propSchema: {
      url: { default: '' },
      title: { default: 'Bookmark' },
    },
    content: 'none',
  },
  {
    render: ({ block, editor }) => {
      const validation = validateExternalUrl(block.props.url)

      const handleConfigure = () => {
        const nextTitle = window.prompt('Bookmark title', block.props.title) ?? block.props.title
        const nextUrl = window.prompt('Bookmark URL', block.props.url) ?? block.props.url

        editor.updateBlock(block, {
          type: 'bookmarkCard',
          props: {
            title: nextTitle.trim() || 'Bookmark',
            url: nextUrl.trim(),
          },
        })
      }

      return (
        <div className="custom-block bookmark-block" contentEditable={false}>
          <div className="custom-block-header custom-block-header-row">
            <span>{block.props.title}</span>
            <button type="button" className="custom-block-action" onClick={handleConfigure}>
              Configure
            </button>
          </div>
          {validation.ok ? (
            <a
              className="bookmark-link"
              href={validation.normalizedUrl}
              target="_blank"
              rel="noreferrer"
            >
              {validation.normalizedUrl}
            </a>
          ) : (
            <div className="custom-block-empty">Add a valid HTTPS URL.</div>
          )}
        </div>
      )
    },
  }
)()

const CalloutBlock = createReactBlockSpec(
  {
    type: 'callout',
    propSchema: {
      emoji: { default: '!' },
      tone: { default: 'default', values: toneValues },
    },
    content: 'inline',
  },
  {
    render: ({ block, contentRef }) => {
      return (
        <div className={`custom-block callout-block tone-${block.props.tone}`}>
          <span className="callout-emoji" contentEditable={false}>
            {block.props.emoji}
          </span>
          <div className="callout-content" ref={contentRef} />
        </div>
      )
    },
  }
)()

const ToggleSectionBlock = createReactBlockSpec(
  {
    type: 'toggleSection',
    propSchema: {
      collapsed: { default: true },
    },
    content: 'inline',
  },
  {
    render: ({ block, editor, contentRef }) => {
      const toggleCollapsed = () => {
        editor.updateBlock(block, {
          type: 'toggleSection',
          props: { collapsed: !block.props.collapsed },
        })
      }

      return (
        <div className="custom-block toggle-section-block">
          <button
            type="button"
            className="toggle-section-button"
            contentEditable={false}
            onClick={toggleCollapsed}
          >
            <span className="toggle-section-caret">{block.props.collapsed ? '▸' : '▾'}</span>
            <span>Toggle section</span>
          </button>
          <div
            className={`toggle-section-content ${block.props.collapsed ? 'is-collapsed' : ''}`}
            ref={contentRef}
          />
        </div>
      )
    },
  }
)()

export const editorSchema = BlockNoteSchema.create({
  blockSpecs: {
    ...defaultBlockSpecs,
    calendarEmbed: CalendarEmbedBlock,
    bookmarkCard: BookmarkCardBlock,
    callout: CalloutBlock,
    toggleSection: ToggleSectionBlock,
  },
})
