import { useEffect } from 'react'
import { useSettingsStore } from '@stores/settings-store'
import { useUIStore } from '@stores/ui-store'
import { useChatStore } from '@stores/chat-store'
import { TitleBar } from './TitleBar'
import { Sidebar } from './Sidebar'
import { ChatPage } from '@pages/ChatPage'
import { SettingsPage } from '@pages/SettingsPage'
import { AboutPage } from '@pages/AboutPage'
import { ToastContainer } from '@components/common/ToastContainer'

export function AppShell(): JSX.Element {
  const { currentPage, toasts, removeToast } = useUIStore()
  const { loadSettings, theme } = useSettingsStore()

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  // Apply theme
  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('light', 'dark')
    if (theme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      root.classList.add(isDark ? 'dark' : 'light')
    } else {
      root.classList.add(theme)
    }
  }, [theme])

  // Listen for screenshot captures
  useEffect(() => {
    const cleanup = window.electronAPI.onCaptureComplete((data: string) => {
      const chatStore = useChatStore.getState()
      const uiStore = useUIStore.getState()
      if (chatStore.sessionId) {
        chatStore.setPendingScreenshot(data)
      } else {
        chatStore.startSession(data)
      }
      uiStore.setCurrentPage('chat')
    })
    return cleanup
  }, [])

  // Listen for navigation from main process (tray menu)
  useEffect(() => {
    const cleanup = window.electronAPI.onNavigate((path: string) => {
      const page = path.replace('/', '') as 'home' | 'chat' | 'settings' | 'about'
      if (['home', 'chat', 'settings', 'about'].includes(page)) {
        useUIStore.getState().setCurrentPage(page)
      }
    })
    return cleanup
  }, [])

  const renderPage = (): JSX.Element => {
    switch (currentPage) {
      case 'settings':
        return <SettingsPage />
      case 'about':
        return <AboutPage />
      case 'chat':
      default:
        return <ChatPage />
    }
  }

  return (
    <div className="app-shell">
      <TitleBar />
      <div className="app-body">
        <main className="app-content">{renderPage()}</main>
      </div>
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  )
}
