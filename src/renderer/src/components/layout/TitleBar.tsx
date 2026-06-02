import { useState, useEffect, useRef } from 'react'
import { Minus, Square, X, Copy, Menu, Home, MessageSquare, Settings, Info, Camera } from 'lucide-react'
import { useUIStore } from '@stores/ui-store'
import { cn } from '@lib/utils'

export function TitleBar(): JSX.Element {
  const [isMaximized, setIsMaximized] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const { currentPage, setCurrentPage } = useUIStore()

  useEffect(() => {
    const checkMaximized = async (): Promise<void> => {
      try {
        const maximized = await window.electronAPI.isMaximized()
        setIsMaximized(maximized)
      } catch {
        // Ignore
      }
    }
    checkMaximized()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const navItems = [
    { id: 'chat' as const, label: 'Chat', icon: MessageSquare },
    { id: 'settings' as const, label: 'Settings', icon: Settings }
  ]

  const handleNav = (id: typeof navItems[0]['id']) => {
    setCurrentPage(id)
    setMenuOpen(false)
  }

  const handleCapture = async () => {
    setMenuOpen(false)
    try {
      await window.electronAPI.startCapture()
    } catch (error) {
      console.error('Capture failed:', error)
    }
  }

  return (
    <div className="title-bar">
      <div className="title-bar-drag">
        <div className="title-bar-logo">
          <div className="title-bar-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <defs>
                <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="#c084fc" />
                </linearGradient>
              </defs>
              <rect x="3" y="3" width="18" height="18" rx="4" stroke="url(#logoGrad)" strokeWidth="2" />
              <circle cx="12" cy="12" r="3" fill="url(#logoGrad)" />
              <path d="M12 3v4M12 17v4M3 12h4M17 12h4" stroke="url(#logoGrad)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <span className="title-bar-text">SnapAssist AI</span>
        </div>
      </div>
      
      <div className="title-bar-menu-container" ref={menuRef}>
        <button 
          className="title-bar-menu-btn" 
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <Menu size={16} />
        </button>
        
        {menuOpen && (
          <div className="title-bar-dropdown">
            {navItems.map((item) => (
              <button
                key={item.id}
                className={cn('dropdown-item', currentPage === item.id && 'active')}
                onClick={() => handleNav(item.id)}
              >
                <item.icon size={16} />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="title-bar-controls">
        <button
          className="title-bar-btn"
          onClick={() => window.electronAPI.minimize()}
          aria-label="Minimize"
        >
          <Minus size={14} />
        </button>
        <button
          className="title-bar-btn"
          onClick={() => {
            window.electronAPI.maximize()
            setIsMaximized(!isMaximized)
          }}
          aria-label={isMaximized ? 'Restore' : 'Maximize'}
        >
          {isMaximized ? <Copy size={12} /> : <Square size={12} />}
        </button>
        <button
          className="title-bar-btn title-bar-btn-close"
          onClick={() => window.electronAPI.close()}
          aria-label="Close"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  )
}
