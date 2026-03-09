import { MantineProvider } from '@mantine/core'
import { Sidebar } from './components/Sidebar/Sidebar'
import { PageView } from './components/PageView'
import { usePagesStore } from './store/pagesStore'

export default function App() {
  const { sidebarOpen } = usePagesStore()

  return (
    <MantineProvider>
      <div className="notion-app-shell">
        <Sidebar />
        <main className={`notion-main-shell ${sidebarOpen ? 'with-sidebar' : 'without-sidebar'}`}>
          <div className="titlebar-drag h-11 flex-shrink-0" />
          <PageView />
        </main>
      </div>
    </MantineProvider>
  )
}
