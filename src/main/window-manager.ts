import { BrowserWindow, screen, shell } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'

export class WindowManager {
  private mainWindow: BrowserWindow | null = null
  private captureWindows: BrowserWindow[] = []
  private overlayWindow: BrowserWindow | null = null

  createMainWindow(): BrowserWindow {
    const primaryDisplay = screen.getPrimaryDisplay()
    const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize
    const winWidth = 340
    const winHeight = 520

    this.mainWindow = new BrowserWindow({
      width: winWidth,
      height: winHeight,
      x: Math.round((screenWidth - winWidth) / 2),
      y: Math.round((screenHeight - winHeight) / 2),
      minWidth: 300,
      minHeight: 400,
      show: false,
      frame: false,
      alwaysOnTop: true,
      titleBarStyle: 'hidden',
      transparent: false,
      skipTaskbar: true,
      backgroundColor: '#000000',
      icon: join(__dirname, '../../resources/icon.png'),
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: false
      }
    })

    this.mainWindow.setAlwaysOnTop(true, 'floating')

    this.mainWindow.on('ready-to-show', () => {
      this.mainWindow?.show()
    })

    this.mainWindow.webContents.setWindowOpenHandler((details) => {
      shell.openExternal(details.url)
      return { action: 'deny' }
    })

    // Load the renderer
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      this.mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
      this.mainWindow.loadFile(join(__dirname, '../renderer/main.html'))
    }

    return this.mainWindow
  }

  createCaptureWindows(): BrowserWindow[] {
    this.closeCaptureWindows()

    const displays = screen.getAllDisplays()

    this.captureWindows = displays.map((display) => {
      const win = new BrowserWindow({
        x: display.bounds.x,
        y: display.bounds.y,
        width: display.bounds.width,
        height: display.bounds.height,
        transparent: true,
        frame: false,
        fullscreen: true,
        alwaysOnTop: true,
        skipTaskbar: true,
        resizable: false,
        movable: false,
        focusable: true,
        hasShadow: false,
        webPreferences: {
          preload: join(__dirname, '../preload/capture.js'),
          contextIsolation: true,
          nodeIntegration: false,
          sandbox: false
        }
      })

      win.setAlwaysOnTop(true, 'screen-saver')
      win.setVisibleOnAllWorkspaces(true)

      // Load capture UI
      if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
        win.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/capture/index.html`)
      } else {
        win.loadFile(join(__dirname, '../renderer/capture/index.html'))
      }

      return win
    })

    return this.captureWindows
  }

  closeCaptureWindows(): void {
    this.captureWindows.forEach((win) => {
      if (!win.isDestroyed()) {
        win.close()
      }
    })
    this.captureWindows = []
  }

  createOverlayWindow(): BrowserWindow {
    if (this.overlayWindow && !this.overlayWindow.isDestroyed()) {
      this.overlayWindow.focus()
      return this.overlayWindow
    }

    const primaryDisplay = screen.getPrimaryDisplay()
    const { width: screenWidth } = primaryDisplay.workAreaSize

    this.overlayWindow = new BrowserWindow({
      width: 480,
      height: 620,
      minWidth: 380,
      minHeight: 400,
      x: screenWidth - 500,
      y: 60,
      frame: false,
      transparent: false,
      backgroundColor: '#000000',
      alwaysOnTop: true,
      skipTaskbar: false,
      resizable: true,
      movable: true,
      show: false,
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: false
      }
    })

    this.overlayWindow.setAlwaysOnTop(true, 'floating')

    this.overlayWindow.on('ready-to-show', () => {
      this.overlayWindow?.show()
    })

    this.overlayWindow.on('closed', () => {
      this.overlayWindow = null
    })

    // Load overlay content (same renderer, different route)
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      this.overlayWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}#/overlay`)
    } else {
      this.overlayWindow.loadFile(join(__dirname, '../renderer/main.html'), {
        hash: '/overlay'
      })
    }

    return this.overlayWindow
  }

  getMainWindow(): BrowserWindow | null {
    return this.mainWindow
  }

  getOverlayWindow(): BrowserWindow | null {
    return this.overlayWindow
  }

  getCaptureWindows(): BrowserWindow[] {
    return this.captureWindows
  }

  sendToMainWindow(channel: string, ...args: unknown[]): void {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send(channel, ...args)
    }
  }

  sendToOverlay(channel: string, ...args: unknown[]): void {
    if (this.overlayWindow && !this.overlayWindow.isDestroyed()) {
      this.overlayWindow.webContents.send(channel, ...args)
    }
  }

  closeOverlay(): void {
    if (this.overlayWindow && !this.overlayWindow.isDestroyed()) {
      this.overlayWindow.close()
      this.overlayWindow = null
    }
  }
}
