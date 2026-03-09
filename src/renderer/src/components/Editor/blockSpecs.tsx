import { useEffect, useState } from 'react'
import { BlockNoteSchema, defaultBlockSpecs } from '@blocknote/core'
import { createReactBlockSpec } from '@blocknote/react'
import { usePagesStore } from '../../store/pagesStore'
import {
  isAllowedCalendarUrl,
  isAllowedImageUrl,
  isAllowedVideoUrl,
  validateExternalUrl,
} from './embedSafety'

const toneValues = ['default', 'info', 'warning', 'success'] as const
const buttonVariants = ['default', 'primary', 'outline'] as const

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

const VideoEmbedBlock = createReactBlockSpec(
  {
    type: 'videoEmbed',
    propSchema: {
      url: { default: '' },
      title: { default: 'Video' },
    },
    content: 'none',
  },
  {
    render: ({ block, editor }) => {
      const validation = validateExternalUrl(block.props.url)
      const isAllowed = validation.ok && isAllowedVideoUrl(block.props.url)

      const handleConfigure = () => {
        const nextTitle = window.prompt('Video title', block.props.title) ?? block.props.title
        const nextUrl = window.prompt('Video URL', block.props.url) ?? block.props.url

        editor.updateBlock(block, {
          type: 'videoEmbed',
          props: {
            title: nextTitle.trim() || 'Video',
            url: nextUrl.trim(),
          },
        })
      }

      return (
        <div className="custom-block" contentEditable={false}>
          <div className="custom-block-header custom-block-header-row">
            <span>{block.props.title}</span>
            <button type="button" className="custom-block-action" onClick={handleConfigure}>
              Configure
            </button>
          </div>
          {isAllowed ? (
            <iframe
              src={validation.normalizedUrl}
              title={block.props.title || 'Video embed'}
              className="calendar-embed-iframe"
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
          ) : (
            <div className="custom-block-empty">Add a supported YouTube or Vimeo HTTPS URL.</div>
          )}
        </div>
      )
    },
  }
)()

const ImageEmbedBlock = createReactBlockSpec(
  {
    type: 'imageEmbed',
    propSchema: {
      url: { default: '' },
      alt: { default: '' },
    },
    content: 'none',
  },
  {
    render: ({ block, editor }) => {
      const validation = validateExternalUrl(block.props.url)
      const isAllowed = validation.ok && isAllowedImageUrl(block.props.url)

      const handleConfigure = () => {
        const nextAlt = window.prompt('Alt text', block.props.alt) ?? block.props.alt
        const nextUrl = window.prompt('Image URL', block.props.url) ?? block.props.url

        editor.updateBlock(block, {
          type: 'imageEmbed',
          props: {
            alt: nextAlt.trim(),
            url: nextUrl.trim(),
          },
        })
      }

      return (
        <div className="custom-block" contentEditable={false}>
          <div className="custom-block-header custom-block-header-row">
            <span>Image</span>
            <button type="button" className="custom-block-action" onClick={handleConfigure}>
              Configure
            </button>
          </div>
          {isAllowed ? (
            <img className="custom-image-embed" src={validation.normalizedUrl} alt={block.props.alt || 'Embedded image'} />
          ) : (
            <div className="custom-block-empty">Add an allowed HTTPS image URL.</div>
          )}
        </div>
      )
    },
  }
)()

const QuoteCalloutBlock = createReactBlockSpec(
  {
    type: 'quoteCallout',
    propSchema: {
      attribution: { default: '' },
      tone: { default: 'default', values: toneValues },
    },
    content: 'inline',
  },
  {
    render: ({ block, contentRef }) => (
      <div className={`custom-block quote-callout tone-${block.props.tone}`}>
        <div className="quote-callout-body" ref={contentRef} />
        <div className="quote-callout-attribution">{block.props.attribution || '— Add attribution'}</div>
      </div>
    ),
  }
)()

const DividerLabelBlock = createReactBlockSpec(
  {
    type: 'dividerLabel',
    propSchema: {
      label: { default: 'Section' },
    },
    content: 'none',
  },
  {
    render: ({ block, editor }) => (
      <div className="custom-divider-label" contentEditable={false}>
        <span>{block.props.label}</span>
        <button
          type="button"
          className="custom-block-action"
          onClick={() => {
            const nextLabel = window.prompt('Section label', block.props.label) ?? block.props.label
            editor.updateBlock(block, {
              type: 'dividerLabel',
              props: { label: nextLabel.trim() || 'Section' },
            })
          }}
        >
          Edit
        </button>
      </div>
    ),
  }
)()

const ButtonLinkBlock = createReactBlockSpec(
  {
    type: 'buttonLink',
    propSchema: {
      label: { default: 'Click here' },
      url: { default: '' },
      variant: { default: 'default', values: buttonVariants },
    },
    content: 'none',
  },
  {
    render: ({ block, editor }) => {
      const validation = validateExternalUrl(block.props.url)
      const handleConfigure = () => {
        const nextLabel = window.prompt('Button label', block.props.label) ?? block.props.label
        const nextUrl = window.prompt('Button URL', block.props.url) ?? block.props.url

        editor.updateBlock(block, {
          type: 'buttonLink',
          props: {
            label: nextLabel.trim() || 'Click here',
            url: nextUrl.trim(),
            variant: block.props.variant,
          },
        })
      }

      return (
        <div className="custom-block" contentEditable={false}>
          <div className="custom-block-header custom-block-header-row">
            <span>Button link</span>
            <button type="button" className="custom-block-action" onClick={handleConfigure}>
              Configure
            </button>
          </div>
          {validation.ok ? (
            <a
              href={validation.normalizedUrl}
              target="_blank"
              rel="noreferrer"
              className={`custom-button-link variant-${block.props.variant}`}
            >
              {block.props.label}
            </a>
          ) : (
            <div className="custom-block-empty">Add a valid HTTPS URL.</div>
          )}
        </div>
      )
    },
  }
)()

const CodeCalloutBlock = createReactBlockSpec(
  {
    type: 'codeCallout',
    propSchema: {
      language: { default: 'plaintext' },
      caption: { default: '' },
      code: { default: '' },
    },
    content: 'none',
  },
  {
    render: ({ block, editor }) => (
      <div className="custom-block" contentEditable={false}>
        <div className="custom-block-header custom-block-header-row">
          <span>{block.props.language}</span>
          <button
            type="button"
            className="custom-block-action"
            onClick={() => {
              const language = window.prompt('Language', block.props.language) ?? block.props.language
              const caption = window.prompt('Caption', block.props.caption) ?? block.props.caption
              const code = window.prompt('Code', block.props.code) ?? block.props.code

              editor.updateBlock(block, {
                type: 'codeCallout',
                props: {
                  language: language.trim() || 'plaintext',
                  caption: caption.trim(),
                  code,
                },
              })
            }}
          >
            Configure
          </button>
        </div>
        <pre className="custom-code-callout">{block.props.code || '// Add code'}</pre>
        <div className="custom-block-empty">{block.props.caption || 'Add a caption'}</div>
      </div>
    ),
  }
)()

const TocBlock = createReactBlockSpec(
  {
    type: 'tocBlock',
    propSchema: {
      maxDepth: { default: 3 },
    },
    content: 'none',
  },
  {
    render: ({ block, editor }) => (
      <div className="custom-block" contentEditable={false}>
        <div className="custom-block-header custom-block-header-row">
          <span>Table of contents</span>
          <button
            type="button"
            className="custom-block-action"
            onClick={() => {
              const nextDepth = window.prompt('Max heading depth', String(block.props.maxDepth))
              const maxDepth = Number(nextDepth)

              editor.updateBlock(block, {
                type: 'tocBlock',
                props: {
                  maxDepth: Number.isFinite(maxDepth) && maxDepth > 0 ? maxDepth : 3,
                },
              })
            }}
          >
            Configure
          </button>
        </div>
        <div className="custom-block-empty">Headings up to H{block.props.maxDepth} will appear here.</div>
      </div>
    ),
  }
)()

function DatabaseBlockView({
  block,
  editor,
  mode,
}: {
  block: { props: { collectionId: string; title: string; viewMode: 'table' | 'gallery' } }
  editor: {
    updateBlock: (block: unknown, patch: unknown) => void
  }
  mode: 'table' | 'gallery'
}) {
  const {
    collections,
    collectionEntries,
    createCollection,
    createCollectionEntry,
    updateCollectionEntry,
    deleteCollectionEntry,
    loadCollectionEntries,
    loadCollections,
  } = usePagesStore()
  const [loading, setLoading] = useState(false)
  const collection = collections.find((entry) => entry.id === block.props.collectionId)
  const entries = collectionEntries[block.props.collectionId] ?? []

  useEffect(() => {
    void loadCollections()
    if (block.props.collectionId) {
      void loadCollectionEntries(block.props.collectionId)
    }
  }, [block.props.collectionId, loadCollectionEntries, loadCollections])

  const ensureCollection = async () => {
    if (collection) return collection.id

    setLoading(true)
    try {
      const created = await createCollection({
        name: block.props.title || (mode === 'gallery' ? 'Gallery database' : 'Table database'),
        kind: mode,
        icon: mode === 'gallery' ? '🖼️' : '🗂️',
      })

      editor.updateBlock(block, {
        type: mode === 'gallery' ? 'databaseGallery' : 'databaseTable',
        props: {
          title: block.props.title || created.name,
          collectionId: created.id,
          viewMode: mode,
        },
      })

      return created.id
    } finally {
      setLoading(false)
    }
  }

  const handleAddEntry = async () => {
    const collectionId = await ensureCollection()
    await createCollectionEntry({
      collection_id: collectionId,
      properties: {
        title: mode === 'gallery' ? 'New card' : 'New row',
        description: '',
        status: 'Draft',
      },
    })
  }

  if (!collection && !block.props.collectionId) {
    return (
      <div className="custom-block database-block" contentEditable={false}>
        <div className="custom-block-header custom-block-header-row">
          <span>{block.props.title}</span>
          <button className="custom-block-action" type="button" onClick={() => void handleAddEntry()}>
            {loading ? 'Creating…' : 'Create database'}
          </button>
        </div>
        <div className="custom-block-empty">
          Create a {mode === 'gallery' ? 'gallery' : 'table'} database and start adding entries.
        </div>
      </div>
    )
  }

  return (
    <div className="custom-block database-block" contentEditable={false}>
      <div className="custom-block-header custom-block-header-row">
        <span>{collection?.name || block.props.title}</span>
        <button className="custom-block-action" type="button" onClick={() => void handleAddEntry()}>
          Add {mode === 'gallery' ? 'card' : 'row'}
        </button>
      </div>

      {entries.length === 0 ? (
        <div className="custom-block-empty">No entries yet.</div>
      ) : mode === 'gallery' ? (
        <div className="database-gallery-grid">
          {entries.map((entry) => (
            <div className="database-gallery-card" key={entry.id}>
              <input
                className="database-inline-input"
                value={entry.properties.title}
                onChange={(event) => {
                  void updateCollectionEntry(entry.id, {
                    properties: {
                      ...entry.properties,
                      title: event.target.value,
                    },
                  })
                }}
              />
              <textarea
                className="database-inline-textarea"
                value={entry.properties.description}
                onChange={(event) => {
                  void updateCollectionEntry(entry.id, {
                    properties: {
                      ...entry.properties,
                      description: event.target.value,
                    },
                  })
                }}
              />
              <button
                className="custom-block-action"
                type="button"
                onClick={() => void deleteCollectionEntry(entry.id, entry.collection_id)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="database-table-wrap">
          <div className="database-table-head">
            <span>Title</span>
            <span>Description</span>
            <span>Status</span>
            <span>Action</span>
          </div>
          {entries.map((entry) => (
            <div className="database-table-row" key={entry.id}>
              <input
                className="database-inline-input"
                value={entry.properties.title}
                onChange={(event) => {
                  void updateCollectionEntry(entry.id, {
                    properties: {
                      ...entry.properties,
                      title: event.target.value,
                    },
                  })
                }}
              />
              <input
                className="database-inline-input"
                value={entry.properties.description}
                onChange={(event) => {
                  void updateCollectionEntry(entry.id, {
                    properties: {
                      ...entry.properties,
                      description: event.target.value,
                    },
                  })
                }}
              />
              <input
                className="database-inline-input"
                value={entry.properties.status}
                onChange={(event) => {
                  void updateCollectionEntry(entry.id, {
                    properties: {
                      ...entry.properties,
                      status: event.target.value,
                    },
                  })
                }}
              />
              <button
                className="custom-block-action"
                type="button"
                onClick={() => void deleteCollectionEntry(entry.id, entry.collection_id)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const DatabaseTableBlock = createReactBlockSpec(
  {
    type: 'databaseTable',
    propSchema: {
      title: { default: 'Table database' },
      collectionId: { default: '' },
      viewMode: { default: 'table', values: ['table', 'gallery'] as const },
    },
    content: 'none',
  },
  {
    render: ({ block, editor }) => {
      return <DatabaseBlockView block={block} editor={editor} mode="table" />
    },
  }
)()

const DatabaseGalleryBlock = createReactBlockSpec(
  {
    type: 'databaseGallery',
    propSchema: {
      title: { default: 'Gallery database' },
      collectionId: { default: '' },
      viewMode: { default: 'gallery', values: ['table', 'gallery'] as const },
    },
    content: 'none',
  },
  {
    render: ({ block, editor }) => {
      return <DatabaseBlockView block={block} editor={editor} mode="gallery" />
    },
  }
)()

const BookmarkRichBlock = createReactBlockSpec(
  {
    type: 'bookmarkRich',
    propSchema: {
      url: { default: '' },
      title: { default: '' },
      description: { default: '' },
      imageUrl: { default: '' },
    },
    content: 'none',
  },
  {
    render: ({ block, editor }) => {
      const urlValidation = validateExternalUrl(block.props.url)
      const imageValidation = block.props.imageUrl ? validateExternalUrl(block.props.imageUrl) : null
      const hasImage = imageValidation?.ok && isAllowedImageUrl(block.props.imageUrl)

      return (
        <div className="custom-block" contentEditable={false}>
          <div className="custom-block-header custom-block-header-row">
            <span>Rich bookmark</span>
            <button
              type="button"
              className="custom-block-action"
              onClick={() => {
                const title = window.prompt('Title', block.props.title) ?? block.props.title
                const description = window.prompt('Description', block.props.description) ?? block.props.description
                const url = window.prompt('URL', block.props.url) ?? block.props.url
                const imageUrl = window.prompt('Preview image URL', block.props.imageUrl) ?? block.props.imageUrl

                editor.updateBlock(block, {
                  type: 'bookmarkRich',
                  props: {
                    title: title.trim(),
                    description: description.trim(),
                    url: url.trim(),
                    imageUrl: imageUrl.trim(),
                  },
                })
              }}
            >
              Configure
            </button>
          </div>

          {urlValidation.ok ? (
            <a href={urlValidation.normalizedUrl} target="_blank" rel="noreferrer" className="bookmark-rich-card">
              {hasImage && <img src={imageValidation.normalizedUrl} alt={block.props.title || 'Bookmark preview'} className="bookmark-rich-image" />}
              <div className="bookmark-rich-copy">
                <div className="bookmark-rich-title">{block.props.title || urlValidation.normalizedUrl}</div>
                <div className="bookmark-rich-description">{block.props.description || 'Add a short description.'}</div>
                <div className="bookmark-rich-url">{urlValidation.normalizedUrl}</div>
              </div>
            </a>
          ) : (
            <div className="custom-block-empty">Add a valid HTTPS URL for this bookmark.</div>
          )}
        </div>
      )
    },
  }
)()

const alertTones = ['info', 'warning', 'error', 'success'] as const

const AlertBlock = createReactBlockSpec(
  {
    type: 'alertBlock',
    propSchema: {
      tone: { default: 'info', values: alertTones },
      title: { default: '' },
    },
    content: 'inline',
  },
  {
    render: ({ block, contentRef }) => (
      <div className={`custom-block alert-block alert-${block.props.tone}`}>
        {block.props.title && (
          <div className="alert-title" contentEditable={false}>{block.props.title}</div>
        )}
        <div className="alert-content" ref={contentRef} />
      </div>
    ),
  }
)()

const ProgressBarBlock = createReactBlockSpec(
  {
    type: 'progressBar',
    propSchema: {
      value: { default: 0 },
      max: { default: 100 },
      label: { default: '' },
    },
    content: 'none',
  },
  {
    render: ({ block, editor }) => {
      const pct = Math.min(100, Math.max(0, (block.props.value / block.props.max) * 100))
      return (
        <div className="custom-block progress-bar-block" contentEditable={false}>
          {block.props.label && <div className="progress-label">{block.props.label}</div>}
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <div className="progress-value">{Math.round(pct)}%</div>
          <button
            type="button"
            className="custom-block-action"
            onClick={() => {
              const val = window.prompt('Value', String(block.props.value))
              const max = window.prompt('Max', String(block.props.max))
              const label = window.prompt('Label', block.props.label) ?? block.props.label
              editor.updateBlock(block, {
                type: 'progressBar',
                props: {
                  value: Number(val) || 0,
                  max: Number(max) || 100,
                  label: label.trim(),
                },
              })
            }}
          >
            Configure
          </button>
        </div>
      )
    },
  }
)()

const KbdBlock = createReactBlockSpec(
  {
    type: 'kbdBlock',
    propSchema: {
      keys: { default: '' },
    },
    content: 'none',
  },
  {
    render: ({ block, editor }) => {
      const parts = block.props.keys ? block.props.keys.split('+').map((k: string) => k.trim()) : []
      return (
        <div className="custom-block kbd-block" contentEditable={false}>
          {parts.length > 0 ? (
            <span className="kbd-sequence">
              {parts.map((key: string, i: number) => (
                <span key={i}>
                  <kbd className="kbd-key">{key}</kbd>
                  {i < parts.length - 1 && <span className="kbd-separator">+</span>}
                </span>
              ))}
            </span>
          ) : (
            <span className="custom-block-empty">No shortcut defined</span>
          )}
          <button
            type="button"
            className="custom-block-action"
            onClick={() => {
              const keys = window.prompt('Keyboard shortcut (e.g. Cmd+Shift+P)', block.props.keys)
              editor.updateBlock(block, {
                type: 'kbdBlock',
                props: { keys: (keys ?? block.props.keys).trim() },
              })
            }}
          >
            Edit
          </button>
        </div>
      )
    },
  }
)()

const MathBlock = createReactBlockSpec(
  {
    type: 'mathBlock',
    propSchema: {
      expression: { default: '' },
    },
    content: 'none',
  },
  {
    render: ({ block, editor }) => (
      <div className="custom-block math-block" contentEditable={false}>
        {block.props.expression ? (
          <pre className="math-expression">{block.props.expression}</pre>
        ) : (
          <div className="custom-block-empty">Add a math expression</div>
        )}
        <button
          type="button"
          className="custom-block-action"
          onClick={() => {
            const expr = window.prompt('Math expression', block.props.expression)
            editor.updateBlock(block, {
              type: 'mathBlock',
              props: { expression: (expr ?? block.props.expression).trim() },
            })
          }}
        >
          Edit
        </button>
      </div>
    ),
  }
)()

const FileAttachmentBlock = createReactBlockSpec(
  {
    type: 'fileAttachment',
    propSchema: {
      fileName: { default: '' },
      fileSize: { default: '' },
      url: { default: '' },
    },
    content: 'none',
  },
  {
    render: ({ block, editor }) => {
      const validation = block.props.url ? validateExternalUrl(block.props.url) : null
      return (
        <div className="custom-block file-attachment-block" contentEditable={false}>
          <div className="file-attachment-icon">
            <svg width="20" height="20" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M4 1h5.586L13 4.414V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1z" stroke="currentColor" strokeWidth="1.2" fill="none" />
              <path d="M9 1v4h4" stroke="currentColor" strokeWidth="1.2" fill="none" />
            </svg>
          </div>
          <div className="file-attachment-info">
            <div className="file-attachment-name">{block.props.fileName || 'No file'}</div>
            {block.props.fileSize && <div className="file-attachment-size">{block.props.fileSize}</div>}
          </div>
          {validation?.ok && (
            <a href={validation.normalizedUrl} target="_blank" rel="noreferrer" className="custom-block-action">
              Download
            </a>
          )}
          <button
            type="button"
            className="custom-block-action"
            onClick={() => {
              const name = window.prompt('File name', block.props.fileName) ?? block.props.fileName
              const size = window.prompt('File size', block.props.fileSize) ?? block.props.fileSize
              const url = window.prompt('File URL', block.props.url) ?? block.props.url
              editor.updateBlock(block, {
                type: 'fileAttachment',
                props: { fileName: name.trim(), fileSize: size.trim(), url: url.trim() },
              })
            }}
          >
            Configure
          </button>
        </div>
      )
    },
  }
)()

const TabsBlock = createReactBlockSpec(
  {
    type: 'tabsBlock',
    propSchema: {
      tabs: { default: 'Tab 1,Tab 2,Tab 3' },
      activeTab: { default: 0 },
    },
    content: 'inline',
  },
  {
    render: ({ block, editor, contentRef }) => {
      const tabNames = block.props.tabs.split(',').map((t: string) => t.trim()).filter(Boolean)
      return (
        <div className="custom-block tabs-block">
          <div className="tabs-header" contentEditable={false}>
            {tabNames.map((name: string, i: number) => (
              <button
                type="button"
                key={i}
                className={`tabs-tab ${i === block.props.activeTab ? 'is-active' : ''}`}
                onClick={() => editor.updateBlock(block, { type: 'tabsBlock', props: { activeTab: i } })}
              >
                {name}
              </button>
            ))}
            <button
              type="button"
              className="custom-block-action"
              onClick={() => {
                const tabs = window.prompt('Tab names (comma-separated)', block.props.tabs)
                editor.updateBlock(block, { type: 'tabsBlock', props: { tabs: (tabs ?? block.props.tabs).trim() } })
              }}
            >
              Edit tabs
            </button>
          </div>
          <div className="tabs-content" ref={contentRef} />
        </div>
      )
    },
  }
)()

const TimelineItemBlock = createReactBlockSpec(
  {
    type: 'timelineItem',
    propSchema: {
      date: { default: '' },
      status: { default: 'default', values: ['default', 'complete', 'active', 'upcoming'] as const },
    },
    content: 'inline',
  },
  {
    render: ({ block, contentRef }) => (
      <div className={`custom-block timeline-item-block status-${block.props.status}`}>
        <div className="timeline-marker" contentEditable={false}>
          <div className="timeline-dot" />
          <div className="timeline-line" />
        </div>
        <div className="timeline-body">
          {block.props.date && <div className="timeline-date" contentEditable={false}>{block.props.date}</div>}
          <div className="timeline-content" ref={contentRef} />
        </div>
      </div>
    ),
  }
)()

const StepListBlock = createReactBlockSpec(
  {
    type: 'stepList',
    propSchema: {
      stepNumber: { default: 1 },
    },
    content: 'inline',
  },
  {
    render: ({ block, contentRef }) => (
      <div className="custom-block step-list-block">
        <div className="step-number" contentEditable={false}>{block.props.stepNumber}</div>
        <div className="step-content" ref={contentRef} />
      </div>
    ),
  }
)()

const ProConListBlock = createReactBlockSpec(
  {
    type: 'proConList',
    propSchema: {
      pros: { default: '' },
      cons: { default: '' },
    },
    content: 'none',
  },
  {
    render: ({ block, editor }) => {
      const proItems = block.props.pros ? block.props.pros.split('\n').filter(Boolean) : []
      const conItems = block.props.cons ? block.props.cons.split('\n').filter(Boolean) : []
      return (
        <div className="custom-block procon-block" contentEditable={false}>
          <div className="procon-column procon-pro">
            <div className="procon-heading">Pros</div>
            {proItems.length > 0 ? proItems.map((item: string, i: number) => (
              <div key={i} className="procon-item procon-item-pro">{item}</div>
            )) : <div className="custom-block-empty">Add pros</div>}
          </div>
          <div className="procon-column procon-con">
            <div className="procon-heading">Cons</div>
            {conItems.length > 0 ? conItems.map((item: string, i: number) => (
              <div key={i} className="procon-item procon-item-con">{item}</div>
            )) : <div className="custom-block-empty">Add cons</div>}
          </div>
          <button
            type="button"
            className="custom-block-action"
            onClick={() => {
              const pros = window.prompt('Pros (one per line)', block.props.pros) ?? block.props.pros
              const cons = window.prompt('Cons (one per line)', block.props.cons) ?? block.props.cons
              editor.updateBlock(block, { type: 'proConList', props: { pros, cons } })
            }}
          >
            Edit
          </button>
        </div>
      )
    },
  }
)()

const MetricCardBlock = createReactBlockSpec(
  {
    type: 'metricCard',
    propSchema: {
      value: { default: '0' },
      label: { default: 'Metric' },
      trend: { default: '', values: ['', 'up', 'down', 'flat'] as const },
    },
    content: 'none',
  },
  {
    render: ({ block, editor }) => (
      <div className="custom-block metric-card-block" contentEditable={false}>
        <div className="metric-value">{block.props.value}</div>
        <div className="metric-label">{block.props.label}</div>
        {block.props.trend && (
          <div className={`metric-trend trend-${block.props.trend}`}>
            {block.props.trend === 'up' ? '↑' : block.props.trend === 'down' ? '↓' : '→'}
          </div>
        )}
        <button
          type="button"
          className="custom-block-action"
          onClick={() => {
            const value = window.prompt('Value', block.props.value) ?? block.props.value
            const label = window.prompt('Label', block.props.label) ?? block.props.label
            editor.updateBlock(block, { type: 'metricCard', props: { value: value.trim(), label: label.trim() } })
          }}
        >
          Configure
        </button>
      </div>
    ),
  }
)()

const ColumnLayoutBlock = createReactBlockSpec(
  {
    type: 'columnLayout',
    propSchema: {
      ratio: { default: '50-50', values: ['50-50', '33-67', '67-33', '33-33-33'] as const },
    },
    content: 'inline',
  },
  {
    render: ({ block, contentRef, editor }) => (
      <div className={`custom-block column-layout-block layout-${block.props.ratio}`}>
        <div className="column-layout-header" contentEditable={false}>
          <span>Columns ({block.props.ratio})</span>
          <button
            type="button"
            className="custom-block-action"
            onClick={() => {
              const ratio = window.prompt('Ratio (50-50, 33-67, 67-33, 33-33-33)', block.props.ratio) ?? block.props.ratio
              editor.updateBlock(block, { type: 'columnLayout', props: { ratio: ratio.trim() as '50-50' } })
            }}
          >
            Change ratio
          </button>
        </div>
        <div className="column-layout-content" ref={contentRef} />
      </div>
    ),
  }
)()

const EmbedBlock = createReactBlockSpec(
  {
    type: 'embedBlock',
    propSchema: {
      url: { default: '' },
      title: { default: 'Embed' },
      height: { default: 400 },
    },
    content: 'none',
  },
  {
    render: ({ block, editor }) => {
      const validation = validateExternalUrl(block.props.url)
      return (
        <div className="custom-block" contentEditable={false}>
          <div className="custom-block-header custom-block-header-row">
            <span>{block.props.title}</span>
            <button
              type="button"
              className="custom-block-action"
              onClick={() => {
                const title = window.prompt('Title', block.props.title) ?? block.props.title
                const url = window.prompt('URL', block.props.url) ?? block.props.url
                const height = window.prompt('Height (px)', String(block.props.height))
                editor.updateBlock(block, {
                  type: 'embedBlock',
                  props: { title: title.trim(), url: url.trim(), height: Number(height) || 400 },
                })
              }}
            >
              Configure
            </button>
          </div>
          {validation.ok ? (
            <iframe
              src={validation.normalizedUrl}
              title={block.props.title}
              style={{ width: '100%', height: block.props.height, border: 'none', borderRadius: 6 }}
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
          ) : (
            <div className="custom-block-empty">Add a valid HTTPS URL to embed.</div>
          )}
        </div>
      )
    },
  }
)()

const AudioEmbedBlock = createReactBlockSpec(
  {
    type: 'audioEmbed',
    propSchema: {
      url: { default: '' },
      title: { default: 'Audio' },
    },
    content: 'none',
  },
  {
    render: ({ block, editor }) => {
      const validation = validateExternalUrl(block.props.url)
      return (
        <div className="custom-block audio-embed-block" contentEditable={false}>
          <div className="custom-block-header custom-block-header-row">
            <span>{block.props.title}</span>
            <button
              type="button"
              className="custom-block-action"
              onClick={() => {
                const title = window.prompt('Title', block.props.title) ?? block.props.title
                const url = window.prompt('Audio URL', block.props.url) ?? block.props.url
                editor.updateBlock(block, { type: 'audioEmbed', props: { title: title.trim(), url: url.trim() } })
              }}
            >
              Configure
            </button>
          </div>
          {validation.ok ? (
            <audio controls src={validation.normalizedUrl} className="audio-player">
              Audio not supported
            </audio>
          ) : (
            <div className="custom-block-empty">Add a valid HTTPS audio URL.</div>
          )}
        </div>
      )
    },
  }
)()

const MAP_ALLOWED_HOSTS = ['www.google.com', 'maps.google.com', 'www.openstreetmap.org']

const MapEmbedBlock = createReactBlockSpec(
  {
    type: 'mapEmbed',
    propSchema: {
      url: { default: '' },
      title: { default: 'Map' },
    },
    content: 'none',
  },
  {
    render: ({ block, editor }) => {
      const validation = validateExternalUrl(block.props.url)
      const isAllowed = validation.ok && MAP_ALLOWED_HOSTS.some(
        (h) => validation.hostname === h || validation.hostname.endsWith(`.${h}`)
      )
      return (
        <div className="custom-block" contentEditable={false}>
          <div className="custom-block-header custom-block-header-row">
            <span>{block.props.title}</span>
            <button
              type="button"
              className="custom-block-action"
              onClick={() => {
                const title = window.prompt('Map title', block.props.title) ?? block.props.title
                const url = window.prompt('Map URL', block.props.url) ?? block.props.url
                editor.updateBlock(block, { type: 'mapEmbed', props: { title: title.trim(), url: url.trim() } })
              }}
            >
              Configure
            </button>
          </div>
          {isAllowed ? (
            <iframe
              src={validation.normalizedUrl}
              title={block.props.title}
              className="calendar-embed-iframe"
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              sandbox="allow-scripts allow-same-origin"
            />
          ) : (
            <div className="custom-block-empty">Add a Google Maps or OpenStreetMap HTTPS URL.</div>
          )}
        </div>
      )
    },
  }
)()

const badgeColors = ['gray', 'blue', 'green', 'yellow', 'red', 'purple'] as const

const StatusBadgeBlock = createReactBlockSpec(
  {
    type: 'statusBadge',
    propSchema: {
      label: { default: 'Status' },
      color: { default: 'gray', values: badgeColors },
    },
    content: 'none',
  },
  {
    render: ({ block, editor }) => (
      <div className="custom-block" contentEditable={false}>
        <span className={`status-badge badge-${block.props.color}`}>{block.props.label}</span>
        <button
          type="button"
          className="custom-block-action"
          onClick={() => {
            const label = window.prompt('Label', block.props.label) ?? block.props.label
            const color = window.prompt('Color (gray, blue, green, yellow, red, purple)', block.props.color) ?? block.props.color
            editor.updateBlock(block, { type: 'statusBadge', props: { label: label.trim(), color: color.trim() as 'gray' } })
          }}
        >
          Edit
        </button>
      </div>
    ),
  }
)()

const RatingBlock = createReactBlockSpec(
  {
    type: 'ratingBlock',
    propSchema: {
      value: { default: 0 },
      max: { default: 5 },
    },
    content: 'none',
  },
  {
    render: ({ block, editor }) => {
      const stars = Array.from({ length: block.props.max }, (_, i) => i < block.props.value)
      return (
        <div className="custom-block rating-block" contentEditable={false}>
          <div className="rating-stars">
            {stars.map((filled, i) => (
              <button
                key={i}
                type="button"
                className={`rating-star ${filled ? 'is-filled' : ''}`}
                onClick={() => editor.updateBlock(block, { type: 'ratingBlock', props: { value: i + 1 } })}
              >
                {filled ? '★' : '☆'}
              </button>
            ))}
          </div>
          <span className="rating-value">{block.props.value}/{block.props.max}</span>
        </div>
      )
    },
  }
)()

const DefinitionListBlock = createReactBlockSpec(
  {
    type: 'definitionList',
    propSchema: {
      term: { default: '' },
    },
    content: 'inline',
  },
  {
    render: ({ block, editor, contentRef }) => (
      <div className="custom-block definition-list-block">
        <dt className="definition-term" contentEditable={false}>
          {block.props.term || 'Term'}
          <button
            type="button"
            className="custom-block-action"
            onClick={() => {
              const term = window.prompt('Term', block.props.term) ?? block.props.term
              editor.updateBlock(block, { type: 'definitionList', props: { term: term.trim() } })
            }}
          >
            Edit
          </button>
        </dt>
        <dd className="definition-desc" ref={contentRef} />
      </div>
    ),
  }
)()

const ProfileCardBlock = createReactBlockSpec(
  {
    type: 'profileCard',
    propSchema: {
      name: { default: '' },
      role: { default: '' },
      avatarUrl: { default: '' },
    },
    content: 'none',
  },
  {
    render: ({ block, editor }) => {
      const avatarValidation = block.props.avatarUrl ? validateExternalUrl(block.props.avatarUrl) : null
      const hasAvatar = avatarValidation?.ok && isAllowedImageUrl(block.props.avatarUrl)
      return (
        <div className="custom-block profile-card-block" contentEditable={false}>
          <div className="profile-avatar">
            {hasAvatar ? (
              <img src={avatarValidation.normalizedUrl} alt={block.props.name || 'Avatar'} className="profile-avatar-img" />
            ) : (
              <div className="profile-avatar-placeholder">
                {(block.props.name || '?')[0].toUpperCase()}
              </div>
            )}
          </div>
          <div className="profile-info">
            <div className="profile-name">{block.props.name || 'Name'}</div>
            <div className="profile-role">{block.props.role || 'Role'}</div>
          </div>
          <button
            type="button"
            className="custom-block-action"
            onClick={() => {
              const name = window.prompt('Name', block.props.name) ?? block.props.name
              const role = window.prompt('Role', block.props.role) ?? block.props.role
              const avatarUrl = window.prompt('Avatar URL', block.props.avatarUrl) ?? block.props.avatarUrl
              editor.updateBlock(block, { type: 'profileCard', props: { name: name.trim(), role: role.trim(), avatarUrl: avatarUrl.trim() } })
            }}
          >
            Configure
          </button>
        </div>
      )
    },
  }
)()

const bannerStyles = ['default', 'gradient', 'dark'] as const

const BannerBlock = createReactBlockSpec(
  {
    type: 'bannerBlock',
    propSchema: {
      title: { default: '' },
      subtitle: { default: '' },
      style: { default: 'default', values: bannerStyles },
    },
    content: 'none',
  },
  {
    render: ({ block, editor }) => (
      <div className={`custom-block banner-block banner-${block.props.style}`} contentEditable={false}>
        <div className="banner-title">{block.props.title || 'Banner title'}</div>
        {block.props.subtitle && <div className="banner-subtitle">{block.props.subtitle}</div>}
        <button
          type="button"
          className="custom-block-action"
          onClick={() => {
            const title = window.prompt('Title', block.props.title) ?? block.props.title
            const subtitle = window.prompt('Subtitle', block.props.subtitle) ?? block.props.subtitle
            const style = window.prompt('Style (default, gradient, dark)', block.props.style) ?? block.props.style
            editor.updateBlock(block, { type: 'bannerBlock', props: { title: title.trim(), subtitle: subtitle.trim(), style: style.trim() as 'default' } })
          }}
        >
          Configure
        </button>
      </div>
    ),
  }
)()

const DetailsSummaryBlock = createReactBlockSpec(
  {
    type: 'detailsSummary',
    propSchema: {
      summary: { default: 'Click to expand' },
      open: { default: false },
    },
    content: 'inline',
  },
  {
    render: ({ block, editor, contentRef }) => (
      <div className="custom-block details-summary-block">
        <div
          className="details-summary-header"
          contentEditable={false}
          onClick={() => editor.updateBlock(block, { type: 'detailsSummary', props: { open: !block.props.open } })}
        >
          <span className="details-caret">{block.props.open ? '▾' : '▸'}</span>
          <span>{block.props.summary}</span>
        </div>
        <div className={`details-content ${block.props.open ? '' : 'is-collapsed'}`} ref={contentRef} />
      </div>
    ),
  }
)()

const kanbanStatuses = ['todo', 'in-progress', 'done'] as const

const KanbanBoardBlock = createReactBlockSpec(
  {
    type: 'kanbanBoard',
    propSchema: {
      items: { default: '' },
    },
    content: 'none',
  },
  {
    render: ({ block, editor }) => {
      type KanbanItem = { text: string; status: string }
      let parsed: KanbanItem[] = []
      try { parsed = block.props.items ? JSON.parse(block.props.items) : [] } catch { /* empty */ }

      const columns: Record<string, KanbanItem[]> = { todo: [], 'in-progress': [], done: [] }
      for (const item of parsed) {
        const col = columns[item.status] ?? columns.todo
        col.push(item)
      }

      return (
        <div className="custom-block kanban-block" contentEditable={false}>
          <div className="kanban-columns">
            {kanbanStatuses.map((status) => (
              <div key={status} className="kanban-column">
                <div className="kanban-column-header">{status}</div>
                {columns[status].map((item, i) => (
                  <div key={i} className="kanban-card">{item.text}</div>
                ))}
              </div>
            ))}
          </div>
          <button
            type="button"
            className="custom-block-action"
            onClick={() => {
              const raw = window.prompt(
                'Items as JSON array [{text, status}]',
                block.props.items || '[{"text":"Task","status":"todo"}]'
              )
              editor.updateBlock(block, { type: 'kanbanBoard', props: { items: (raw ?? block.props.items).trim() } })
            }}
          >
            Edit items
          </button>
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
    videoEmbed: VideoEmbedBlock,
    imageEmbed: ImageEmbedBlock,
    quoteCallout: QuoteCalloutBlock,
    dividerLabel: DividerLabelBlock,
    buttonLink: ButtonLinkBlock,
    codeCallout: CodeCalloutBlock,
    tocBlock: TocBlock,
    databaseTable: DatabaseTableBlock,
    databaseGallery: DatabaseGalleryBlock,
    bookmarkRich: BookmarkRichBlock,
    alertBlock: AlertBlock,
    progressBar: ProgressBarBlock,
    kbdBlock: KbdBlock,
    mathBlock: MathBlock,
    fileAttachment: FileAttachmentBlock,
    tabsBlock: TabsBlock,
    timelineItem: TimelineItemBlock,
    stepList: StepListBlock,
    proConList: ProConListBlock,
    metricCard: MetricCardBlock,
    columnLayout: ColumnLayoutBlock,
    embedBlock: EmbedBlock,
    audioEmbed: AudioEmbedBlock,
    mapEmbed: MapEmbedBlock,
    statusBadge: StatusBadgeBlock,
    ratingBlock: RatingBlock,
    definitionList: DefinitionListBlock,
    profileCard: ProfileCardBlock,
    bannerBlock: BannerBlock,
    detailsSummary: DetailsSummaryBlock,
    kanbanBoard: KanbanBoardBlock,
  },
})
