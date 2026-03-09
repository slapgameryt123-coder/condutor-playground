import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { filterSuggestionItems } from '@blocknote/core/extensions'
import { BlockNoteView } from '@blocknote/mantine'
import {
  DefaultReactSuggestionItem,
  SuggestionMenuController,
  SuggestionMenuProps,
  useCreateBlockNote,
} from '@blocknote/react'
import type { PageData } from '../../../../preload'
import { usePagesStore } from '../../store/pagesStore'
import { editorSchema } from './blockSpecs'
import { getSlashMenuItems } from './slashMenuItems'

type BlockPreviewKind =
  | 'heading-1'
  | 'heading-2'
  | 'heading-3'
  | 'bullet-list'
  | 'numbered-list'
  | 'check-list'
  | 'quote'
  | 'code'
  | 'table'
  | 'divider'
  | 'callout'
  | 'toggle'
  | 'bookmark'
  | 'calendar'
  | 'video'
  | 'image'
  | 'button'
  | 'toc'
  | 'database-table'
  | 'database-gallery'
  | 'alert'
  | 'progress'
  | 'kbd'
  | 'math'
  | 'file'
  | 'tabs'
  | 'timeline'
  | 'step'
  | 'procon'
  | 'metric'
  | 'columns'
  | 'embed'
  | 'audio'
  | 'map'
  | 'status'
  | 'rating'
  | 'definition'
  | 'profile'
  | 'banner'
  | 'details'
  | 'kanban'
  | 'default'

function getPreviewKind(item: DefaultReactSuggestionItem): BlockPreviewKind {
  const title = item.title.toLowerCase()

  if (title.includes('heading 1')) return 'heading-1'
  if (title.includes('heading 2')) return 'heading-2'
  if (title.includes('heading 3')) return 'heading-3'
  if (title.includes('bullet')) return 'bullet-list'
  if (title.includes('numbered')) return 'numbered-list'
  if (title.includes('check') || title.includes('to-do')) return 'check-list'
  if (title.includes('quote')) return 'quote'
  if (title.includes('code')) return 'code'
  if (title.includes('table') && !title.includes('database') && !title.includes('contents')) return 'table'
  if (title.includes('divider')) return 'divider'
  if (title.includes('alert')) return 'alert'
  if (title.includes('callout')) return 'callout'
  if (title.includes('toggle')) return 'toggle'
  if (title.includes('details')) return 'details'
  if (title.includes('rich bookmark')) return 'bookmark'
  if (title.includes('bookmark')) return 'bookmark'
  if (title.includes('calendar')) return 'calendar'
  if (title.includes('video')) return 'video'
  if (title.includes('audio')) return 'audio'
  if (title.includes('image')) return 'image'
  if (title.includes('file')) return 'file'
  if (title.includes('button')) return 'button'
  if (title.includes('table of contents') || title.includes('toc')) return 'toc'
  if (title.includes('database table')) return 'database-table'
  if (title.includes('database gallery')) return 'database-gallery'
  if (title.includes('progress')) return 'progress'
  if (title.includes('keyboard') || title.includes('kbd')) return 'kbd'
  if (title.includes('math')) return 'math'
  if (title.includes('tabs')) return 'tabs'
  if (title.includes('timeline')) return 'timeline'
  if (title.includes('step')) return 'step'
  if (title.includes('pros')) return 'procon'
  if (title.includes('metric')) return 'metric'
  if (title.includes('column')) return 'columns'
  if (title.includes('embed')) return 'embed'
  if (title.includes('map')) return 'map'
  if (title.includes('status')) return 'status'
  if (title.includes('rating')) return 'rating'
  if (title.includes('definition')) return 'definition'
  if (title.includes('profile')) return 'profile'
  if (title.includes('banner')) return 'banner'
  if (title.includes('kanban')) return 'kanban'

  return 'default'
}

function BlockPreview({ item }: { item: DefaultReactSuggestionItem }) {
  const kind = getPreviewKind(item)

  switch (kind) {
    case 'heading-1':
      return (
        <div className="preview-heading-1">
          <div className="preview-h1">Project plan</div>
          <div className="preview-text">Scope and milestones</div>
        </div>
      )

    case 'heading-2':
      return (
        <div className="preview-heading-2">
          <div className="preview-h2">Design sprint</div>
          <div className="preview-text">Goals and timeline</div>
        </div>
      )

    case 'heading-3':
      return (
        <div className="preview-heading-3">
          <div className="preview-h3">Week 1 tasks</div>
          <div className="preview-text">Research and discovery</div>
        </div>
      )

    case 'bullet-list':
      return (
        <div className="preview-list">
          <div className="preview-list-item">
            <span className="preview-bullet">•</span>
            <span>Clarify goals</span>
          </div>
          <div className="preview-list-item">
            <span className="preview-bullet">•</span>
            <span>Share timeline</span>
          </div>
          <div className="preview-list-item">
            <span className="preview-bullet">•</span>
            <span>Track progress</span>
          </div>
        </div>
      )

    case 'numbered-list':
      return (
        <div className="preview-list">
          <div className="preview-list-item">
            <span className="preview-number">1.</span>
            <span>Draft proposal</span>
          </div>
          <div className="preview-list-item">
            <span className="preview-number">2.</span>
            <span>Review with team</span>
          </div>
          <div className="preview-list-item">
            <span className="preview-number">3.</span>
            <span>Publish final version</span>
          </div>
        </div>
      )

    case 'check-list':
      return (
        <div className="preview-list">
          <div className="preview-list-item">
            <span className="preview-checkbox">☐</span>
            <span className="preview-text-muted">Kickoff call</span>
          </div>
          <div className="preview-list-item">
            <span className="preview-checkbox-checked">☑</span>
            <span className="preview-text-checked">Define requirements</span>
          </div>
          <div className="preview-list-item">
            <span className="preview-checkbox">☐</span>
            <span className="preview-text-muted">Ship v1</span>
          </div>
        </div>
      )

    case 'quote':
      return (
        <div className="preview-quote">
          <div className="preview-quote-bar"></div>
          <div className="preview-quote-text">"Make it work, then make it right."</div>
        </div>
      )

    case 'code':
      return (
        <div className="preview-code-block">
          <div className="preview-code-line">
            <span className="preview-code-keyword">const</span> ready = <span className="preview-code-keyword">true</span>
          </div>
          <div className="preview-code-line">
            <span className="preview-code-keyword">if</span> (ready) deploy()
          </div>
        </div>
      )

    case 'table':
      return (
        <div className="preview-table">
          <div className="preview-table-row preview-table-header">
            <div className="preview-table-cell">Task</div>
            <div className="preview-table-cell">Owner</div>
            <div className="preview-table-cell">Status</div>
          </div>
          <div className="preview-table-row">
            <div className="preview-table-cell">Design</div>
            <div className="preview-table-cell">Maya</div>
            <div className="preview-table-cell">Done</div>
          </div>
          <div className="preview-table-row">
            <div className="preview-table-cell">Development</div>
            <div className="preview-table-cell">Alex</div>
            <div className="preview-table-cell">In progress</div>
          </div>
        </div>
      )

    case 'divider':
      return (
        <div className="preview-divider-wrap">
          <div className="preview-divider"></div>
        </div>
      )

    case 'callout':
      return (
        <div className="preview-callout">
          <div className="preview-callout-emoji">💡</div>
          <div className="preview-callout-text">Review this section before shipping</div>
        </div>
      )

    case 'toggle':
      return (
        <div className="preview-toggle">
          <div className="preview-toggle-header">
            <span className="preview-toggle-icon">▸</span>
            <span className="preview-toggle-title">Click to expand details</span>
          </div>
          <div className="preview-toggle-hint">Hidden content goes here</div>
        </div>
      )

    case 'bookmark':
      return (
        <div className="preview-bookmark">
          <div className="preview-bookmark-title">Project documentation</div>
          <div className="preview-bookmark-url">https://example.com/project-spec</div>
        </div>
      )

    case 'calendar':
      return (
        <div className="preview-calendar">
          <div className="preview-calendar-header">
            <div className="preview-calendar-title">March 2026</div>
            <div className="preview-calendar-controls">‹ ›</div>
          </div>
          <div className="preview-calendar-grid">
            <div className="preview-calendar-day">M</div>
            <div className="preview-calendar-day">T</div>
            <div className="preview-calendar-day">W</div>
            <div className="preview-calendar-day">T</div>
            <div className="preview-calendar-day">F</div>
          </div>
        </div>
      )

    case 'video':
      return (
        <div className="preview-embed-placeholder">
          <svg width="32" height="32" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="preview-icon">
            <path d="M2 3h12v10H2z" stroke="currentColor" strokeWidth="1.2" fill="none" />
            <path d="M6 6l5 3-5 3z" stroke="currentColor" strokeWidth="1.2" fill="none" />
          </svg>
          <div className="preview-text-muted">Embedded video player</div>
        </div>
      )

    case 'image':
      return (
        <div className="preview-embed-placeholder">
          <svg width="32" height="32" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="preview-icon">
            <path d="M2 2h12v12H2z" stroke="currentColor" strokeWidth="1.2" fill="none" />
            <path d="M2 10l3-3 2 2 4-4 3 3" stroke="currentColor" strokeWidth="1.2" fill="none" />
          </svg>
          <div className="preview-text-muted">Responsive image embed</div>
        </div>
      )

    case 'audio':
      return (
        <div className="preview-embed-placeholder">
          <svg width="32" height="32" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="preview-icon">
            <path d="M8 2v12M4 5v6M12 5v6M1 7v2M15 7v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" fill="none" />
          </svg>
          <div className="preview-text-muted">Audio player embed</div>
        </div>
      )

    case 'file':
      return (
        <div className="preview-embed-placeholder">
          <svg width="32" height="32" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="preview-icon">
            <path d="M4 1h5.586L13 4.414V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1z" stroke="currentColor" strokeWidth="1.2" fill="none" />
            <path d="M9 1v4h4" stroke="currentColor" strokeWidth="1.2" fill="none" />
          </svg>
          <div className="preview-text-muted">Downloadable file attachment</div>
        </div>
      )

    case 'button':
      return (
        <div className="preview-embed-placeholder">
          <div style={{ padding: '6px 16px', border: '1.5px solid currentColor', borderRadius: 6, fontSize: 13, fontWeight: 500 }}>
            Click here
          </div>
        </div>
      )

    case 'toc':
      return (
        <div className="preview-list" style={{ gap: 2 }}>
          <div className="preview-list-item"><span className="preview-bullet" style={{ opacity: 0.5 }}>H1</span><span>Introduction</span></div>
          <div className="preview-list-item" style={{ paddingLeft: 12 }}><span className="preview-bullet" style={{ opacity: 0.5 }}>H2</span><span>Getting started</span></div>
          <div className="preview-list-item" style={{ paddingLeft: 24 }}><span className="preview-bullet" style={{ opacity: 0.5 }}>H3</span><span>Installation</span></div>
          <div className="preview-list-item"><span className="preview-bullet" style={{ opacity: 0.5 }}>H1</span><span>Conclusion</span></div>
        </div>
      )

    case 'database-table':
      return (
        <div className="preview-table">
          <div className="preview-table-row preview-table-header">
            <div className="preview-table-cell">Name</div>
            <div className="preview-table-cell">Status</div>
          </div>
          <div className="preview-table-row">
            <div className="preview-table-cell">Feature A</div>
            <div className="preview-table-cell">Done</div>
          </div>
          <div className="preview-table-row">
            <div className="preview-table-cell">Feature B</div>
            <div className="preview-table-cell">Draft</div>
          </div>
        </div>
      )

    case 'database-gallery':
      return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          <div style={{ background: 'var(--color-surface-subtle, #f5f5f5)', borderRadius: 6, padding: 8, fontSize: 11 }}>Card 1</div>
          <div style={{ background: 'var(--color-surface-subtle, #f5f5f5)', borderRadius: 6, padding: 8, fontSize: 11 }}>Card 2</div>
          <div style={{ background: 'var(--color-surface-subtle, #f5f5f5)', borderRadius: 6, padding: 8, fontSize: 11 }}>Card 3</div>
          <div style={{ background: 'var(--color-surface-subtle, #f5f5f5)', borderRadius: 6, padding: 8, fontSize: 11 }}>Card 4</div>
        </div>
      )

    case 'alert':
      return (
        <div style={{ border: '1px solid #3b82f6', borderLeft: '3px solid #3b82f6', borderRadius: 6, padding: '8px 10px', fontSize: 12 }}>
          <div style={{ fontWeight: 600, marginBottom: 2 }}>Heads up</div>
          <div style={{ opacity: 0.75 }}>This is an important alert message.</div>
        </div>
      )

    case 'progress':
      return (
        <div>
          <div style={{ fontSize: 11, marginBottom: 4, opacity: 0.7 }}>Project progress</div>
          <div style={{ height: 8, background: '#e5e7eb', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ width: '65%', height: '100%', background: '#3b82f6', borderRadius: 4 }} />
          </div>
          <div style={{ fontSize: 10, marginTop: 2, opacity: 0.5 }}>65%</div>
        </div>
      )

    case 'kbd':
      return (
        <div style={{ display: 'flex', gap: 4, alignItems: 'center', justifyContent: 'center', padding: 8 }}>
          <kbd style={{ padding: '2px 6px', border: '1px solid #d1d5db', borderRadius: 4, fontSize: 12, background: '#f9fafb', boxShadow: '0 1px 0 #d1d5db' }}>Cmd</kbd>
          <span style={{ opacity: 0.4, fontSize: 11 }}>+</span>
          <kbd style={{ padding: '2px 6px', border: '1px solid #d1d5db', borderRadius: 4, fontSize: 12, background: '#f9fafb', boxShadow: '0 1px 0 #d1d5db' }}>Shift</kbd>
          <span style={{ opacity: 0.4, fontSize: 11 }}>+</span>
          <kbd style={{ padding: '2px 6px', border: '1px solid #d1d5db', borderRadius: 4, fontSize: 12, background: '#f9fafb', boxShadow: '0 1px 0 #d1d5db' }}>P</kbd>
        </div>
      )

    case 'math':
      return (
        <div style={{ textAlign: 'center', fontFamily: 'serif', fontSize: 16, padding: 8 }}>
          E = mc<sup>2</sup>
        </div>
      )

    case 'tabs':
      return (
        <div>
          <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #e5e7eb', marginBottom: 6 }}>
            <div style={{ padding: '4px 10px', borderBottom: '2px solid #3b82f6', fontSize: 11, fontWeight: 600 }}>Tab 1</div>
            <div style={{ padding: '4px 10px', fontSize: 11, opacity: 0.5 }}>Tab 2</div>
            <div style={{ padding: '4px 10px', fontSize: 11, opacity: 0.5 }}>Tab 3</div>
          </div>
          <div style={{ fontSize: 11, opacity: 0.7, padding: '0 4px' }}>Tab content goes here...</div>
        </div>
      )

    case 'timeline':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingLeft: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6', flexShrink: 0 }} />
            <div style={{ fontSize: 11 }}><strong>Jan 2026</strong> — Project kickoff</div>
          </div>
          <div style={{ width: 1, height: 10, background: '#d1d5db', marginLeft: 3 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', border: '1.5px solid #d1d5db', flexShrink: 0 }} />
            <div style={{ fontSize: 11, opacity: 0.6 }}><strong>Mar 2026</strong> — Beta release</div>
          </div>
        </div>
      )

    case 'step':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#3b82f6', color: '#fff', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>1</div>
            <div style={{ fontSize: 11 }}>Install dependencies</div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#3b82f6', color: '#fff', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>2</div>
            <div style={{ fontSize: 11 }}>Configure settings</div>
          </div>
        </div>
      )

    case 'procon':
      return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#16a34a', marginBottom: 4 }}>Pros</div>
            <div style={{ fontSize: 10, opacity: 0.7 }}>+ Fast setup</div>
            <div style={{ fontSize: 10, opacity: 0.7 }}>+ Great docs</div>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#dc2626', marginBottom: 4 }}>Cons</div>
            <div style={{ fontSize: 10, opacity: 0.7 }}>- Limited plugins</div>
            <div style={{ fontSize: 10, opacity: 0.7 }}>- Learning curve</div>
          </div>
        </div>
      )

    case 'metric':
      return (
        <div style={{ textAlign: 'center', padding: 8 }}>
          <div style={{ fontSize: 24, fontWeight: 700 }}>1,234</div>
          <div style={{ fontSize: 11, opacity: 0.6 }}>Total users</div>
          <div style={{ fontSize: 11, color: '#16a34a' }}>↑ 12%</div>
        </div>
      )

    case 'columns':
      return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div style={{ background: 'var(--color-surface-subtle, #f5f5f5)', borderRadius: 6, padding: 8, fontSize: 10, opacity: 0.6 }}>Column 1 content</div>
          <div style={{ background: 'var(--color-surface-subtle, #f5f5f5)', borderRadius: 6, padding: 8, fontSize: 10, opacity: 0.6 }}>Column 2 content</div>
        </div>
      )

    case 'embed':
      return (
        <div className="preview-embed-placeholder">
          <svg width="32" height="32" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="preview-icon">
            <path d="M1 3h14v10H1z" stroke="currentColor" strokeWidth="1.2" fill="none" />
            <path d="M4 7h8M4 9h5" stroke="currentColor" strokeWidth="1.2" fill="none" />
          </svg>
          <div className="preview-text-muted">External embed via iframe</div>
        </div>
      )

    case 'map':
      return (
        <div className="preview-embed-placeholder">
          <svg width="32" height="32" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="preview-icon">
            <path d="M3 1l4 2 4-2 4 2v12l-4-2-4 2-4-2z" stroke="currentColor" strokeWidth="1.2" fill="none" />
          </svg>
          <div className="preview-text-muted">Map embed</div>
        </div>
      )

    case 'status':
      return (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center', padding: 8 }}>
          <span style={{ padding: '2px 8px', borderRadius: 10, fontSize: 10, background: '#dbeafe', color: '#1e40af' }}>In progress</span>
          <span style={{ padding: '2px 8px', borderRadius: 10, fontSize: 10, background: '#dcfce7', color: '#166534' }}>Done</span>
          <span style={{ padding: '2px 8px', borderRadius: 10, fontSize: 10, background: '#fef3c7', color: '#92400e' }}>Pending</span>
        </div>
      )

    case 'rating':
      return (
        <div style={{ textAlign: 'center', fontSize: 18, padding: 6, letterSpacing: 2 }}>
          ★★★★☆
        </div>
      )

    case 'definition':
      return (
        <div style={{ padding: 4 }}>
          <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 2 }}>Refactoring</div>
          <div style={{ fontSize: 11, opacity: 0.7, paddingLeft: 8, borderLeft: '2px solid #d1d5db' }}>Restructuring code without changing behavior</div>
        </div>
      )

    case 'profile':
      return (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#3b82f6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, flexShrink: 0 }}>A</div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600 }}>Alex Chen</div>
            <div style={{ fontSize: 10, opacity: 0.6 }}>Lead Engineer</div>
          </div>
        </div>
      )

    case 'banner':
      return (
        <div style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)', borderRadius: 8, padding: '12px 16px', color: '#fff', textAlign: 'center' }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>Welcome</div>
          <div style={{ fontSize: 10, opacity: 0.85 }}>Full-width hero banner</div>
        </div>
      )

    case 'details':
      return (
        <div>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center', cursor: 'pointer' }}>
            <span style={{ fontSize: 10, opacity: 0.5 }}>▸</span>
            <span style={{ fontSize: 12, fontWeight: 500 }}>Click to expand</span>
          </div>
          <div style={{ fontSize: 10, opacity: 0.4, paddingLeft: 14, marginTop: 2 }}>Hidden content...</div>
        </div>
      )

    case 'kanban':
      return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4 }}>
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, opacity: 0.5, marginBottom: 3 }}>TODO</div>
            <div style={{ background: 'var(--color-surface-subtle, #f5f5f5)', borderRadius: 4, padding: 4, fontSize: 9, marginBottom: 2 }}>Task A</div>
          </div>
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, opacity: 0.5, marginBottom: 3 }}>IN PROGRESS</div>
            <div style={{ background: 'var(--color-surface-subtle, #f5f5f5)', borderRadius: 4, padding: 4, fontSize: 9, marginBottom: 2 }}>Task B</div>
          </div>
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, opacity: 0.5, marginBottom: 3 }}>DONE</div>
            <div style={{ background: 'var(--color-surface-subtle, #f5f5f5)', borderRadius: 4, padding: 4, fontSize: 9, marginBottom: 2 }}>Task C</div>
          </div>
        </div>
      )

    default:
      return (
        <div className="preview-text">
          <div className="preview-text-muted">Start writing here…</div>
        </div>
      )
  }
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
        {(() => {
          let lastGroup = ''
          return items.map((item, index) => {
            const group = (item as DefaultReactSuggestionItem & { group?: string }).group
            const showGroup = group && group !== lastGroup
            if (group) lastGroup = group
            return (
              <div key={`${item.title}-${index}`}>
                {showGroup && <div className="notion-blocks-menu-group">{group}</div>}
                <button
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
              </div>
            )
          })
        })()}
      </div>

      <div className="notion-blocks-menu-preview-wrap">
        <div className="notion-blocks-menu-preview-title">Preview</div>
        <div className="notion-block-preview-card">
          <div className="notion-block-preview-label">{activeItem.title}</div>
          <div className="notion-block-preview-content">
            <BlockPreview item={activeItem} />
          </div>
        </div>
      </div>
    </div>
  )
}

export function Editor({ page }: { page: PageData | null }) {
  const { updatePage, openPageInNewTab, splitActivePane } = usePagesStore()
  const activePage = page
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout>>()
  const pageIdRef = useRef<string | null>(null)
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved')

  const initialContent = useMemo(() => {
    if (!activePage?.content) return undefined
    try {
      const parsed = JSON.parse(activePage.content)
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : undefined
    } catch {
      return undefined
    }
  }, [activePage?.id])

  const editor = useCreateBlockNote(
    {
      schema: editorSchema,
      initialContent,
    },
    [activePage?.id]
  )

  const slashMenuItems = useMemo(() => getSlashMenuItems(editor), [editor])

  useEffect(() => {
    pageIdRef.current = activePage?.id ?? null
    setSaveStatus('saved')
  }, [activePage?.id])

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    }
  }, [])

  const handleChange = useCallback(() => {
    const currentPageId = pageIdRef.current
    if (!currentPageId) return

    setSaveStatus('saving')
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    saveTimeoutRef.current = setTimeout(() => {
      const content = JSON.stringify(editor.document)
      void updatePage(currentPageId, { content }).finally(() => {
        setSaveStatus('saved')
      })
    }, 500)
  }, [editor, updatePage])

  if (!activePage) return null

  return (
    <div className="px-24 pb-16">
      <div className="editor-toolbar">
        <div className="editor-toolbar-group">
          <span className="editor-toolbar-label">Page</span>
          <button
            className="editor-toolbar-btn"
            onClick={() => void openPageInNewTab(activePage.id)}
            type="button"
          >
            New tab
          </button>
          <button className="editor-toolbar-btn" onClick={() => void splitActivePane()} type="button">
            Split view
          </button>
        </div>
        <div className="editor-toolbar-group">
          <span className="editor-toolbar-save">{saveStatus === 'saving' ? 'Saving…' : 'Saved'}</span>
        </div>
        <div className="editor-toolbar-group">
          <span className="editor-toolbar-label">Insert</span>
          <button
            className="editor-toolbar-btn"
            onClick={() => {
              editor.insertBlocks([{ type: 'callout', props: { emoji: '💡', tone: 'info' } }], editor.getTextCursorPosition().block, 'after')
            }}
            type="button"
          >
            Callout
          </button>
          <button
            className="editor-toolbar-btn"
            onClick={() => {
              editor.insertBlocks([{ type: 'toggleSection', props: { collapsed: true } }], editor.getTextCursorPosition().block, 'after')
            }}
            type="button"
          >
            Toggle
          </button>
        </div>
      </div>
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
