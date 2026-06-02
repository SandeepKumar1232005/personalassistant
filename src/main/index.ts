import { app, BrowserWindow, shell } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import { WindowManager } from './window-manager'
import { ShortcutManager } from './shortcut-manager'
import { ScreenshotEngine } from './screenshot-engine'
import { registerIpcHandlers } from './ipc-handlers'
import { SecureStorage } from './secure-storage'
import { TrayManager } from './tray-manager'
import { PrivacyManager } from './privacy-manager'
import { setupAutoUpdater } from './auto-updater'

class SnapAssistApp {
  private windowManager!: WindowManager
  private shortcutManager!: ShortcutManager
  private screenshotEngine!: ScreenshotEngine
  private secureStorage!: SecureStorage
  private trayManager!: TrayManager
  private privacyManager!: PrivacyManager

  async initialize(): Promise<void> {
    // Enforce single instance
    const gotLock = app.requestSingleInstanceLock()
    if (!gotLock) {
      app.quit()
      return
    }

    app.on('second-instance', () => {
      const mainWindow = this.windowManager?.getMainWindow()
      if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore()
        mainWindow.focus()
      }
    })

    await app.whenReady()

    // Initialize core services
    this.secureStorage = new SecureStorage()
    this.privacyManager = new PrivacyManager()
    this.windowManager = new WindowManager()
    this.screenshotEngine = new ScreenshotEngine(this.windowManager)
    this.shortcutManager = new ShortcutManager(this.screenshotEngine, this.windowManager)

    // Register IPC handlers
    registerIpcHandlers({
      windowManager: this.windowManager,
      screenshotEngine: this.screenshotEngine,
      shortcutManager: this.shortcutManager,
      secureStorage: this.secureStorage,
      privacyManager: this.privacyManager
    })

    // Create main window
    this.windowManager.createMainWindow()

    // Set up system tray
    this.trayManager = new TrayManager(this.windowManager, this.screenshotEngine)

    // Register global shortcuts
    const settings = this.secureStorage.getSettings()
    this.shortcutManager.register(settings.shortcut || 'CommandOrControl+Shift+Space')

    // Set up auto-updater (production only)
    if (!is.dev) {
      setupAutoUpdater(this.windowManager)
    }

    // Handle activation (macOS)
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        this.windowManager.createMainWindow()
      } else {
        this.windowManager.getMainWindow()?.show()
      }
    })

    // Default open or close DevTools by F12 in development
    // and ignore CommandOrControl + R in production
    app.on('browser-window-created', (_, window) => {
      window.webContents.setWindowOpenHandler((details) => {
        shell.openExternal(details.url)
        return { action: 'deny' }
      })
    })
  }

  setupCleanup(): void {
    app.on('will-quit', () => {
      this.shortcutManager?.unregisterAll()
      this.privacyManager?.cleanupAll()
    })

    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit()
      }
    })
  }
}

// Bootstrap
const snapAssist = new SnapAssistApp()
snapAssist.setupCleanup()
snapAssist.initialize().catch(console.error)
