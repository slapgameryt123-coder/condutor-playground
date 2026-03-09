import { BlockNoteEditor } from '@blocknote/core'
import { insertOrUpdateBlockForSlashMenu } from '@blocknote/core/extensions'
import { DefaultReactSuggestionItem, getDefaultReactSlashMenuItems } from '@blocknote/react'

export function getSlashMenuItems(editor: BlockNoteEditor): DefaultReactSuggestionItem[] {
  const defaults = getDefaultReactSlashMenuItems(editor)

  const customItems: DefaultReactSuggestionItem[] = [
    {
      title: 'Calendar embed',
      subtext: 'Embed a Google Calendar or Calendly calendar',
      aliases: ['calendar', 'events', 'schedule'],
      icon: <span>Cal</span>,
      onItemClick: () => {
        insertOrUpdateBlockForSlashMenu(editor, {
          type: 'calendarEmbed',
          props: {
            title: 'Calendar',
            url: '',
          },
        })
      },
    },
    {
      title: 'Bookmark card',
      subtext: 'Save and preview an external link',
      aliases: ['bookmark', 'link card', 'link'],
      icon: <span>Link</span>,
      onItemClick: () => {
        insertOrUpdateBlockForSlashMenu(editor, {
          type: 'bookmarkCard',
          props: {
            title: 'Bookmark',
            url: '',
          },
        })
      },
    },
    {
      title: 'Callout',
      subtext: 'Highlight important notes',
      aliases: ['note', 'tip', 'warning'],
      icon: <span>Note</span>,
      onItemClick: () => {
        insertOrUpdateBlockForSlashMenu(editor, {
          type: 'callout',
          props: {
            emoji: '!',
            tone: 'default',
          },
        })
      },
    },
    {
      title: 'Toggle section',
      subtext: 'Collapsible section for details',
      aliases: ['toggle', 'collapse', 'expand'],
      icon: <span>▸</span>,
      onItemClick: () => {
        insertOrUpdateBlockForSlashMenu(editor, {
          type: 'toggleSection',
          props: {
            collapsed: true,
          },
        })
      },
    },
  ]

  return [...customItems, ...defaults]
}
