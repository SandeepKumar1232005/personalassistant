import { Home, MessageSquare, Settings, Info, Camera, ChevronLeft, ChevronRight } from 'lucide-react'
import { useUIStore } from '@stores/ui-store'
import { useSettingsStore } from '@stores/settings-store'
import { APP_MODE_ICONS, APP_MODE_LABELS } from '@typings/ai'
import { cn } from '@lib/utils'

const NAV_ITEMS = [
  { id: 'chat' as const, label: 'Chat', icon: MessageSquare },
  { id: 'settings' as const, label: 'Settings', icon: Settings }
]

export function Sidebar(): JSX.Element {
  const { currentPage, setCurrentPage, sidebarCollapsed, toggleSidebar } = useUIStore()
  const { appMode } = useSettingsStore()

  const handleCapture = async (): Promise<void> => {
    try {
      await window.electronAPI.startCapture()
    } catch (error) {
      console.error('Capture failed:', error)
    }
  }

  return (
    <aside className={cn('sidebar', sidebarCollapsed && 'sidebar-collapsed')}>
      <div className="sidebar-content">
        {/* Navigation */}
        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={cn('sidebar-nav-item', currentPage === item.id && 'active')}
              onClick={() => setCurrentPage(item.id)}
              title={item.label}
            >
              <item.icon size={20} />
              {!sidebarCollapsed && <span>{item.label}</span>}
              {currentPage === item.id && <div className="sidebar-active-indicator" />}
            </button>
          ))}
        </nav>

        {/* App Mode */}
        {!sidebarCollapsed && (
          <div className="sidebar-mode">
            <span className="sidebar-mode-label">Mode</span>
            <div className="sidebar-mode-badge">
              <span>{APP_MODE_ICONS[appMode]}</span>
              <span>{APP_MODE_LABELS[appMode]}</span>
            </div>
          </div>
        )}
      </div>

      {/* Collapse Toggle */}
      <button className="sidebar-toggle" onClick={toggleSidebar} title={sidebarCollapsed ? 'Expand' : 'Collapse'}>
        {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </aside>
  )
}
