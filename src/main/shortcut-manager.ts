import { globalShortcut } from 'electron'
import { ScreenshotEngine } from './screenshot-engine'
import { WindowManager } from './window-manager'

export class ShortcutManager {
  private currentShortcut: string | null = null
  private screenshotEngine: ScreenshotEngine
  private windowManager: WindowManager

  constructor(screenshotEngine: ScreenshotEngine, windowManager: WindowManager) {
    this.screenshotEngine = screenshotEngine
    this.windowManager = windowManager
  }

  register(shortcut: string): boolean {
    // Unregister existing shortcut first
    if (this.currentShortcut) {
      this.unregister(this.currentShortcut)
    }

    try {
      const success = globalShortcut.register(shortcut, () => {
        console.log(`[ShortcutManager] Shortcut ${shortcut} triggered`)
        
        const mainWindow = this.windowManager.getMainWindow()
        
        if (this.screenshotEngine.getIsCapturing()) {
          // If in capture mode, cancel it
          this.screenshotEngine.cancelCapture()
        } else if (mainWindow && mainWindow.isVisible()) {
          // If the app is visible, hide it
          mainWindow.hide()
        } else if (mainWindow) {
          // Otherwise, show the software
          if (mainWindow.isMinimized()) mainWindow.restore()
          mainWindow.show()
          mainWindow.focus()
        }
      })

      if (success) {
        this.currentShortcut = shortcut
        console.log(`[ShortcutManager] Registered shortcut: ${shortcut}`)
      } else {
        console.warn(`[ShortcutManager] Failed to register shortcut: ${shortcut}`)
      }

      return success
    } catch (error) {
      console.error(`[ShortcutManager] Error registering shortcut:`, error)
      return false
    }
  }

  unregister(shortcut: string): void {
    try {
      globalShortcut.unregister(shortcut)
      if (this.currentShortcut === shortcut) {
        this.currentShortcut = null
      }
    } catch (error) {
      console.error(`[ShortcutManager] Error unregistering shortcut:`, error)
    }
  }

  unregisterAll(): void {
    globalShortcut.unregisterAll()
    this.currentShortcut = null
  }

  updateShortcut(newShortcut: string): boolean {
    return this.register(newShortcut)
  }

  getCurrentShortcut(): string | null {
    return this.currentShortcut
  }

  isRegistered(shortcut: string): boolean {
    return globalShortcut.isRegistered(shortcut)
  }
}
