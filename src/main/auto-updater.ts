import { autoUpdater } from 'electron-updater'
import { WindowManager } from './window-manager'

export function setupAutoUpdater(windowManager: WindowManager): void {
  autoUpdater.autoDownload = false
  autoUpdater.autoInstallOnAppQuit = true

  autoUpdater.on('update-available', (info) => {
    console.log('[AutoUpdater] Update available:', info.version)
    windowManager.sendToMainWindow('update:available', {
      version: info.version,
      releaseDate: info.releaseDate
    })
  })

  autoUpdater.on('update-not-available', () => {
    console.log('[AutoUpdater] No update available')
    windowManager.sendToMainWindow('update:not-available')
  })

  autoUpdater.on('download-progress', (progress) => {
    windowManager.sendToMainWindow('update:progress', {
      percent: progress.percent,
      transferred: progress.transferred,
      total: progress.total
    })
  })

  autoUpdater.on('update-downloaded', () => {
    console.log('[AutoUpdater] Update downloaded')
    windowManager.sendToMainWindow('update:downloaded')
  })

  autoUpdater.on('error', (error) => {
    console.error('[AutoUpdater] Error:', error)
  })

  // Check for updates after a short delay
  setTimeout(() => {
    autoUpdater.checkForUpdates().catch(console.error)
  }, 5000)
}
