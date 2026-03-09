import { useEffect } from 'react'
import { MantineProvider } from '@mantine/core'
import { Sidebar } from './components/Sidebar/Sidebar'
import { PageView } from './components/PageView'
import { usePagesStore } from './store/pagesStore'

export default function App() {
  const { loadPages, sidebarOpen } = usePagesStore()

  useEffect(() => {
    loadPages()
  }, [loadPages])

  return (
    <MantineProvider>
      <div className="flex h-screen">
        <Sidebar />
        <main
          className="flex-1 flex flex-col overflow-hidden transition-all duration-200"
          style={{ marginLeft: sidebarOpen ? 240 : 0 }}
        >
          {/* Title bar drag region */}
          <div className="titlebar-drag h-11 flex-shrink-0" />

          <PageView />
        </main>
      </div>
    </MantineProvider>
  )
}
