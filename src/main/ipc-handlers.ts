import { ipcMain, app, BrowserWindow } from 'electron'
import { WindowManager } from './window-manager'
import { ScreenshotEngine } from './screenshot-engine'
import { ShortcutManager } from './shortcut-manager'
import { SecureStorage } from './secure-storage'
import { PrivacyManager } from './privacy-manager'

interface IpcDependencies {
  windowManager: WindowManager
  screenshotEngine: ScreenshotEngine
  shortcutManager: ShortcutManager
  secureStorage: SecureStorage
  privacyManager: PrivacyManager
}

export function registerIpcHandlers(deps: IpcDependencies): void {
  const { windowManager, screenshotEngine, shortcutManager, secureStorage, privacyManager } = deps

  // ─── Capture ─────────────────────────────────────────────
  ipcMain.handle('capture:start', async () => {
    const mainWindow = windowManager.getMainWindow()
    if (mainWindow && mainWindow.isVisible()) {
      mainWindow.hide()
      // Wait slightly for the window to vanish from screen before taking screenshot
      await new Promise((resolve) => setTimeout(resolve, 200))
    }
    await screenshotEngine.startCapture()
    return true
  })

  ipcMain.handle('capture:full-screen', async () => {
    return await screenshotEngine.captureFullScreen()
  })

  ipcMain.on('capture:region-selected', async (event, region) => {
    const result = await screenshotEngine.captureRegion(region)
    if (result) {
      // Send to main window
      windowManager.sendToMainWindow('capture:complete', result)
      // Also send to overlay if open
      windowManager.sendToOverlay('capture:complete', result)
      
      const mainWindow = windowManager.getMainWindow()
      if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore()
        mainWindow.show()
        mainWindow.focus()
      }
    }
  })

  ipcMain.on('capture:cancel', () => {
    screenshotEngine.cancelCapture()
    const mainWindow = windowManager.getMainWindow()
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.show()
      mainWindow.focus()
    }
  })

  // ─── Settings ────────────────────────────────────────────
  ipcMain.handle('settings:get', () => {
    return secureStorage.getSettings()
  })

  ipcMain.handle('settings:set', (_event, settings) => {
    secureStorage.setSettings(settings)
    return true
  })

  ipcMain.handle('settings:get-api-key', (_event, provider: string) => {
    return secureStorage.getApiKey(provider)
  })

  ipcMain.handle('settings:set-api-key', (_event, provider: string, key: string) => {
    secureStorage.setApiKey(provider, key)
    return true
  })

  // ─── Shortcuts ───────────────────────────────────────────
  ipcMain.handle('shortcut:update', (_event, shortcut: string) => {
    const success = shortcutManager.updateShortcut(shortcut)
    if (success) {
      const settings = secureStorage.getSettings()
      secureStorage.setSettings({ ...settings, shortcut })
    }
    return success
  })

  ipcMain.handle('shortcut:get-current', () => {
    return shortcutManager.getCurrentShortcut()
  })

  // ─── Window Controls ────────────────────────────────────
  ipcMain.on('window:minimize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    win?.minimize()
  })

  ipcMain.on('window:maximize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (win?.isMaximized()) {
      win.unmaximize()
    } else {
      win?.maximize()
    }
  })

  ipcMain.on('window:close', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (win === windowManager.getMainWindow()) {
      win?.hide()
    } else {
      win?.close()
    }
  })

  ipcMain.handle('window:is-maximized', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    return win?.isMaximized() ?? false
  })

  // ─── Overlay ─────────────────────────────────────────────
  ipcMain.handle('overlay:create', () => {
    windowManager.createOverlayWindow()
    return true
  })

  ipcMain.on('overlay:close', () => {
    windowManager.closeOverlay()
  })

  // ─── Privacy ─────────────────────────────────────────────
  ipcMain.handle('privacy:cleanup', async () => {
    privacyManager.cleanupAll()
    return true
  })

  // ─── App Info ────────────────────────────────────────────
  ipcMain.handle('app:version', () => {
    return app.getVersion()
  })

  ipcMain.handle('app:get-path', (_event, name: string) => {
    return app.getPath(name as 'userData' | 'temp' | 'documents')
  })

  ipcMain.handle('app:platform', () => {
    return process.platform
  })

  ipcMain.handle('app:electron-version', () => {
    return process.versions.electron
  })

  ipcMain.handle('app:chrome-version', () => {
    return process.versions.chrome
  })

  ipcMain.handle('app:node-version', () => {
    return process.versions.node
  })
}
