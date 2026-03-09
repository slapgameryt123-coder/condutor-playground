import type { BlockNoteEditor } from '@blocknote/core'
import { insertOrUpdateBlockForSlashMenu } from '@blocknote/core/extensions'
import { DefaultReactSuggestionItem, getDefaultReactSlashMenuItems } from '@blocknote/react'

type SlashCatalogItem = {
  title: string
  subtext: string
  group: string
  aliases: string[]
  icon: React.ReactNode
  insert: () => void
}

function svg(paths: string, size = 16) {
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none" aria-hidden="true" className="slash-icon-svg">
      {paths.split('|').map((d, i) => (
        <path key={i} d={d} stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      ))}
    </svg>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildCustomSlashItems(editor: BlockNoteEditor<any, any, any>): DefaultReactSuggestionItem[] {
  const catalog: SlashCatalogItem[] = [
    // --- Media ---
    {
      title: 'Image embed',
      subtext: 'Embed an image from a URL',
      group: 'Media',
      aliases: ['image', 'img', 'photo', 'picture'],
      icon: svg('M2 2h12v12H2z|M2 10l3-3 2 2 4-4 3 3'),
      insert: () => {
        insertOrUpdateBlockForSlashMenu(editor, { type: 'imageEmbed', props: { url: '', alt: '' } })
      },
    },
    {
      title: 'Video embed',
      subtext: 'Embed a YouTube or Vimeo video',
      group: 'Media',
      aliases: ['video', 'youtube', 'vimeo', 'embed'],
      icon: svg('M2 3h12v10H2z|M6 6l5 3-5 3z'),
      insert: () => {
        insertOrUpdateBlockForSlashMenu(editor, { type: 'videoEmbed', props: { url: '', title: 'Video' } })
      },
    },
    {
      title: 'Audio embed',
      subtext: 'Embed an audio file or podcast',
      group: 'Media',
      aliases: ['audio', 'sound', 'music', 'podcast'],
      icon: svg('M8 2v12|M4 5v6|M12 5v6|M1 7v2|M15 7v2'),
      insert: () => {
        insertOrUpdateBlockForSlashMenu(editor, { type: 'audioEmbed', props: { url: '', title: 'Audio' } })
      },
    },
    {
      title: 'File attachment',
      subtext: 'Attach a downloadable file',
      group: 'Media',
      aliases: ['file', 'attachment', 'download', 'document'],
      icon: svg('M4 1h5.586L13 4.414V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1z|M9 1v4h4'),
      insert: () => {
        insertOrUpdateBlockForSlashMenu(editor, { type: 'fileAttachment', props: { fileName: '', fileSize: '', url: '' } })
      },
    },
    // --- Embeds ---
    {
      title: 'Calendar embed',
      subtext: 'Embed a Google Calendar or Calendly',
      group: 'Embeds',
      aliases: ['calendar', 'events', 'schedule'],
      icon: svg('M2 3h12v11H2z|M2 6h12|M5 1v4|M11 1v4'),
      insert: () => {
        insertOrUpdateBlockForSlashMenu(editor, { type: 'calendarEmbed', props: { title: 'Calendar', url: '' } })
      },
    },
    {
      title: 'Map embed',
      subtext: 'Embed a Google Maps or OpenStreetMap view',
      group: 'Embeds',
      aliases: ['map', 'location', 'google maps', 'directions'],
      icon: svg('M3 1l4 2 4-2 4 2v12l-4-2-4 2-4-2z|M7 3v12|M11 1v12'),
      insert: () => {
        insertOrUpdateBlockForSlashMenu(editor, { type: 'mapEmbed', props: { url: '', title: 'Map' } })
      },
    },
    {
      title: 'Generic embed',
      subtext: 'Embed any external page via iframe',
      group: 'Embeds',
      aliases: ['embed', 'iframe', 'widget', 'external'],
      icon: svg('M1 3h14v10H1z|M4 7h8|M4 9h5'),
      insert: () => {
        insertOrUpdateBlockForSlashMenu(editor, { type: 'embedBlock', props: { url: '', title: 'Embed', height: 400 } })
      },
    },
    // --- Callouts ---
    {
      title: 'Callout',
      subtext: 'Highlight important notes',
      group: 'Callouts',
      aliases: ['note', 'tip', 'callout'],
      icon: svg('M8 1a7 7 0 1 1 0 14A7 7 0 0 1 8 1z|M8 5v3|M8 10v1'),
      insert: () => {
        insertOrUpdateBlockForSlashMenu(editor, { type: 'callout', props: { emoji: '!', tone: 'default' } })
      },
    },
    {
      title: 'Callout info',
      subtext: 'Info-styled callout',
      group: 'Callouts',
      aliases: ['callout info', 'info box', 'information'],
      icon: svg('M8 1a7 7 0 1 1 0 14A7 7 0 0 1 8 1z|M8 7v4|M8 5v.5'),
      insert: () => {
        insertOrUpdateBlockForSlashMenu(editor, { type: 'callout', props: { emoji: '!', tone: 'info' } })
      },
    },
    {
      title: 'Callout warning',
      subtext: 'Warning-styled callout',
      group: 'Callouts',
      aliases: ['callout warning', 'warning box', 'caution'],
      icon: svg('M8 1L1 14h14z|M8 6v4|M8 12v.5'),
      insert: () => {
        insertOrUpdateBlockForSlashMenu(editor, { type: 'callout', props: { emoji: '!', tone: 'warning' } })
      },
    },
    {
      title: 'Callout success',
      subtext: 'Success-styled callout',
      group: 'Callouts',
      aliases: ['callout success', 'success box', 'done'],
      icon: svg('M8 1a7 7 0 1 1 0 14A7 7 0 0 1 8 1z|M5 8l2 2 4-4'),
      insert: () => {
        insertOrUpdateBlockForSlashMenu(editor, { type: 'callout', props: { emoji: '!', tone: 'success' } })
      },
    },
    {
      title: 'Alert',
      subtext: 'Info, warning, error, or success alert',
      group: 'Callouts',
      aliases: ['alert', 'notice', 'message'],
      icon: svg('M1 4h14v9H1z|M8 7v2|M8 11v.5'),
      insert: () => {
        insertOrUpdateBlockForSlashMenu(editor, { type: 'alertBlock', props: { tone: 'info', title: '' } })
      },
    },
    {
      title: 'Quote callout',
      subtext: 'Highlight a quote with attribution',
      group: 'Callouts',
      aliases: ['quote', 'blockquote', 'citation'],
      icon: svg('M3 4h4v4H5l-2 3|M9 4h4v4h-2l-2 3'),
      insert: () => {
        insertOrUpdateBlockForSlashMenu(editor, { type: 'quoteCallout', props: { attribution: '', tone: 'default' } })
      },
    },
    {
      title: 'Banner',
      subtext: 'Full-width hero banner section',
      group: 'Callouts',
      aliases: ['banner', 'hero', 'header section'],
      icon: svg('M1 3h14v10H1z|M4 7h8|M5 9h6'),
      insert: () => {
        insertOrUpdateBlockForSlashMenu(editor, { type: 'bannerBlock', props: { title: '', subtitle: '', style: 'default' } })
      },
    },
    // --- Interactives ---
    {
      title: 'Toggle section',
      subtext: 'Collapsible section for details',
      group: 'Interactive',
      aliases: ['toggle', 'collapse', 'expand', 'accordion'],
      icon: svg('M4 6l4 4 4-4'),
      insert: () => {
        insertOrUpdateBlockForSlashMenu(editor, { type: 'toggleSection', props: { collapsed: true } })
      },
    },
    {
      title: 'Details / Summary',
      subtext: 'Expandable details block',
      group: 'Interactive',
      aliases: ['details', 'summary', 'expand', 'disclosure'],
      icon: svg('M5 3l6 5-6 5'),
      insert: () => {
        insertOrUpdateBlockForSlashMenu(editor, { type: 'detailsSummary', props: { summary: 'Click to expand', open: false } })
      },
    },
    {
      title: 'Tabs',
      subtext: 'Tabbed content sections',
      group: 'Interactive',
      aliases: ['tabs', 'tab', 'tabbed', 'sections'],
      icon: svg('M1 4h14v10H1z|M1 4h5V1h4v3'),
      insert: () => {
        insertOrUpdateBlockForSlashMenu(editor, { type: 'tabsBlock', props: { tabs: 'Tab 1,Tab 2,Tab 3', activeTab: 0 } })
      },
    },
    {
      title: 'Rating',
      subtext: 'Star rating display',
      group: 'Interactive',
      aliases: ['rating', 'stars', 'review', 'score'],
      icon: svg('M8 1l2.2 4.5L15 6.3l-3.5 3.4.8 4.8L8 12.2 3.7 14.5l.8-4.8L1 6.3l4.8-.8z'),
      insert: () => {
        insertOrUpdateBlockForSlashMenu(editor, { type: 'ratingBlock', props: { value: 0, max: 5 } })
      },
    },
    // --- Data display ---
    {
      title: 'Progress bar',
      subtext: 'Visual progress indicator',
      group: 'Data',
      aliases: ['progress', 'bar', 'loading', 'percentage'],
      icon: svg('M1 7h14v2H1z|M1 7h8v2H1z'),
      insert: () => {
        insertOrUpdateBlockForSlashMenu(editor, { type: 'progressBar', props: { value: 0, max: 100, label: '' } })
      },
    },
    {
      title: 'Metric card',
      subtext: 'Display a key metric or statistic',
      group: 'Data',
      aliases: ['metric', 'stat', 'kpi', 'number', 'statistic'],
      icon: svg('M1 14V6l4-4 3 5 4-6 3 4v9z'),
      insert: () => {
        insertOrUpdateBlockForSlashMenu(editor, { type: 'metricCard', props: { value: '0', label: 'Metric', trend: '' } })
      },
    },
    {
      title: 'Status badge',
      subtext: 'Colored status indicator label',
      group: 'Data',
      aliases: ['status', 'badge', 'label', 'tag', 'chip'],
      icon: svg('M4 5h8v6H4z|M6 8h4'),
      insert: () => {
        insertOrUpdateBlockForSlashMenu(editor, { type: 'statusBadge', props: { label: 'Status', color: 'gray' } })
      },
    },
    {
      title: 'Kanban board',
      subtext: 'Simple kanban task board',
      group: 'Data',
      aliases: ['kanban', 'board', 'cards', 'tasks'],
      icon: svg('M2 2h3v12H2z|M7 2h3v8H7z|M12 2h3v10H12z'),
      insert: () => {
        insertOrUpdateBlockForSlashMenu(editor, { type: 'kanbanBoard', props: { items: '' } })
      },
    },
    // --- Layout ---
    {
      title: 'Divider label',
      subtext: 'Labeled horizontal divider',
      group: 'Layout',
      aliases: ['divider', 'separator', 'section', 'hr'],
      icon: svg('M1 8h5|M10 8h5|M7 6v4'),
      insert: () => {
        insertOrUpdateBlockForSlashMenu(editor, { type: 'dividerLabel', props: { label: 'Section' } })
      },
    },
    {
      title: 'Columns',
      subtext: 'Multi-column layout',
      group: 'Layout',
      aliases: ['columns', 'column', 'layout', 'grid', 'side by side'],
      icon: svg('M1 2h6v12H1z|M9 2h6v12H9z'),
      insert: () => {
        insertOrUpdateBlockForSlashMenu(editor, { type: 'columnLayout', props: { ratio: '50-50' } })
      },
    },
    {
      title: 'Table of contents',
      subtext: 'Auto-generated page outline',
      group: 'Layout',
      aliases: ['toc', 'outline', 'contents', 'index'],
      icon: svg('M3 3h10|M3 6h7|M3 9h8|M3 12h5'),
      insert: () => {
        insertOrUpdateBlockForSlashMenu(editor, { type: 'tocBlock', props: { maxDepth: 3 } })
      },
    },
    // --- Advanced ---
    {
      title: 'Code callout',
      subtext: 'Code snippet with caption',
      group: 'Advanced',
      aliases: ['code', 'snippet', 'codeblock', 'pre'],
      icon: svg('M5 4L1 8l4 4|M11 4l4 4-4 4'),
      insert: () => {
        insertOrUpdateBlockForSlashMenu(editor, { type: 'codeCallout', props: { language: 'plaintext', caption: '', code: '' } })
      },
    },
    {
      title: 'Math equation',
      subtext: 'Display a math expression',
      group: 'Advanced',
      aliases: ['math', 'equation', 'formula', 'latex', 'katex'],
      icon: svg('M3 3l5 10|M13 3L8 13|M2 8h12'),
      insert: () => {
        insertOrUpdateBlockForSlashMenu(editor, { type: 'mathBlock', props: { expression: '' } })
      },
    },
    {
      title: 'Keyboard shortcut',
      subtext: 'Display a keyboard shortcut',
      group: 'Advanced',
      aliases: ['kbd', 'keyboard', 'shortcut', 'hotkey', 'key'],
      icon: svg('M1 4h14v8H1z|M4 7h1|M7 7h2|M11 7h1|M4 9h8'),
      insert: () => {
        insertOrUpdateBlockForSlashMenu(editor, { type: 'kbdBlock', props: { keys: '' } })
      },
    },
    {
      title: 'Definition',
      subtext: 'Term and definition pair',
      group: 'Advanced',
      aliases: ['definition', 'glossary', 'term', 'dictionary'],
      icon: svg('M3 3h10|M3 7h7|M3 11h5'),
      insert: () => {
        insertOrUpdateBlockForSlashMenu(editor, { type: 'definitionList', props: { term: '' } })
      },
    },
    // --- Lists ---
    {
      title: 'Timeline',
      subtext: 'Timeline milestone marker',
      group: 'Lists',
      aliases: ['timeline', 'milestone', 'history', 'event'],
      icon: svg('M4 2v12|M4 4h8|M4 8h6|M4 12h9'),
      insert: () => {
        insertOrUpdateBlockForSlashMenu(editor, { type: 'timelineItem', props: { date: '', status: 'default' } })
      },
    },
    {
      title: 'Step list',
      subtext: 'Numbered step with description',
      group: 'Lists',
      aliases: ['step', 'steps', 'instructions', 'guide', 'tutorial'],
      icon: svg('M4 3h9|M4 8h9|M4 13h9|M1 3h1|M1 8h1|M1 13h1'),
      insert: () => {
        insertOrUpdateBlockForSlashMenu(editor, { type: 'stepList', props: { stepNumber: 1 } })
      },
    },
    {
      title: 'Pros and cons',
      subtext: 'Side-by-side comparison list',
      group: 'Lists',
      aliases: ['pros', 'cons', 'comparison', 'versus', 'pro con'],
      icon: svg('M1 2h6v12H1z|M9 2h6v12H9z|M3 5l1 1 2-2|M11 5h3'),
      insert: () => {
        insertOrUpdateBlockForSlashMenu(editor, { type: 'proConList', props: { pros: '', cons: '' } })
      },
    },
    // --- Links ---
    {
      title: 'Bookmark card',
      subtext: 'Save and preview an external link',
      group: 'Links',
      aliases: ['bookmark', 'link card', 'link'],
      icon: svg('M3 1h10v14L8 12 3 15z'),
      insert: () => {
        insertOrUpdateBlockForSlashMenu(editor, { type: 'bookmarkCard', props: { title: 'Bookmark', url: '' } })
      },
    },
    {
      title: 'Rich bookmark',
      subtext: 'Link preview with title and description',
      group: 'Links',
      aliases: ['bookmark rich', 'rich link', 'preview', 'unfurl'],
      icon: svg('M3 1h10v14L8 12 3 15z|M6 5h4|M6 7h3'),
      insert: () => {
        insertOrUpdateBlockForSlashMenu(editor, { type: 'bookmarkRich', props: { url: '', title: '', description: '', imageUrl: '' } })
      },
    },
    {
      title: 'Button link',
      subtext: 'Styled button that opens a URL',
      group: 'Links',
      aliases: ['button', 'cta', 'action', 'link button'],
      icon: svg('M2 5h12v6H2z|M6 8h4'),
      insert: () => {
        insertOrUpdateBlockForSlashMenu(editor, { type: 'buttonLink', props: { label: 'Click here', url: '', variant: 'default' } })
      },
    },
    {
      title: 'Profile card',
      subtext: 'Person or team member card',
      group: 'Links',
      aliases: ['profile', 'person', 'team', 'member', 'card'],
      icon: svg('M8 1a7 7 0 1 1 0 14A7 7 0 0 1 8 1z|M8 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4z|M3 13c0-2.8 2.2-5 5-5s5 2.2 5 5'),
      insert: () => {
        insertOrUpdateBlockForSlashMenu(editor, { type: 'profileCard', props: { name: '', role: '', avatarUrl: '' } })
      },
    },
    // --- Database ---
    {
      title: 'Database table',
      subtext: 'Table database with inline rows',
      group: 'Database',
      aliases: ['database', 'table database', 'db table'],
      icon: svg('M1 3h14v10H1z|M1 6h14|M1 9h14|M6 3v10|M11 3v10'),
      insert: () => {
        insertOrUpdateBlockForSlashMenu(editor, { type: 'databaseTable', props: { title: 'Table database', collectionId: '', viewMode: 'table' } })
      },
    },
    {
      title: 'Database gallery',
      subtext: 'Gallery database with cards',
      group: 'Database',
      aliases: ['database gallery', 'gallery database', 'db gallery', 'cards'],
      icon: svg('M1 2h6v5H1z|M9 2h6v5H9z|M1 9h6v5H1z|M9 9h6v5H9z'),
      insert: () => {
        insertOrUpdateBlockForSlashMenu(editor, { type: 'databaseGallery', props: { title: 'Gallery database', collectionId: '', viewMode: 'gallery' } })
      },
    },
  ]

  return catalog.map((item) => ({
    title: item.title,
    subtext: item.subtext,
    group: item.group,
    aliases: item.aliases,
    icon: item.icon,
    onItemClick: item.insert,
  }))
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getSlashMenuItems(editor: BlockNoteEditor<any, any, any>): DefaultReactSuggestionItem[] {
  const defaults = getDefaultReactSlashMenuItems(editor as BlockNoteEditor)
  const customItems = buildCustomSlashItems(editor)

  return [...customItems, ...defaults]
}
