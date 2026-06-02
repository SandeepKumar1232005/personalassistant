import { Tray, Menu, nativeImage } from 'electron'
import { join } from 'path'
import { WindowManager } from './window-manager'
import { ScreenshotEngine } from './screenshot-engine'

export class TrayManager {
  private tray: Tray | null = null

  constructor(
    private windowManager: WindowManager,
    private screenshotEngine: ScreenshotEngine
  ) {
    this.createTray()
  }

  private createTray(): void {
    // Create a simple 16x16 tray icon
    const icon = this.createDefaultIcon()
    this.tray = new Tray(icon)
    this.tray.setToolTip('SnapAssist AI')
    this.updateContextMenu()

    this.tray.on('click', () => {
      const mainWindow = this.windowManager.getMainWindow()
      if (mainWindow) {
        if (mainWindow.isVisible()) {
          mainWindow.focus()
        } else {
          mainWindow.show()
        }
      }
    })
  }

  private updateContextMenu(): void {
    const contextMenu = Menu.buildFromTemplate([
      {
        label: '📸 Capture Screenshot',
        click: (): void => {
          this.screenshotEngine.startCapture()
        }
      },
      { type: 'separator' },
      {
        label: 'Show Window',
        click: (): void => {
          const mainWindow = this.windowManager.getMainWindow()
          mainWindow?.show()
          mainWindow?.focus()
        }
      },
      {
        label: 'Settings',
        click: (): void => {
          const mainWindow = this.windowManager.getMainWindow()
          mainWindow?.show()
          mainWindow?.focus()
          this.windowManager.sendToMainWindow('navigate', '/settings')
        }
      },
      { type: 'separator' },
      {
        label: 'Quit SnapAssist AI',
        role: 'quit'
      }
    ])

    this.tray?.setContextMenu(contextMenu)
  }

  private createDefaultIcon(): nativeImage {
    // Create a simple colored icon programmatically
    const size = 16
    const canvas = Buffer.alloc(size * size * 4)

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4
        // Create a gradient icon (indigo to purple)
        const r = Math.round(99 + (x / size) * 60)
        const g = Math.round(102 + (y / size) * 30)
        const b = Math.round(241 - (x / size) * 20)
        const a = 255

        // Make it circular
        const cx = x - size / 2
        const cy = y - size / 2
        const dist = Math.sqrt(cx * cx + cy * cy)

        if (dist <= size / 2 - 1) {
          canvas[idx] = r
          canvas[idx + 1] = g
          canvas[idx + 2] = b
          canvas[idx + 3] = a
        } else {
          canvas[idx] = 0
          canvas[idx + 1] = 0
          canvas[idx + 2] = 0
          canvas[idx + 3] = 0
        }
      }
    }

    return nativeImage.createFromBuffer(canvas, { width: size, height: size })
  }

  destroy(): void {
    this.tray?.destroy()
    this.tray = null
  }
}
