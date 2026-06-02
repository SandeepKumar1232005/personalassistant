import { contextBridge, ipcRenderer } from 'electron'

// Type-safe API exposed to the renderer
const electronAPI = {
  // ─── Capture ─────────────────────────────────────────────
  startCapture: (): Promise<void> => ipcRenderer.invoke('capture:start'),
  captureFullScreen: (): Promise<string | null> => ipcRenderer.invoke('capture:full-screen'),
  onCaptureComplete: (callback: (data: string) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, data: string): void => callback(data)
    ipcRenderer.on('capture:complete', handler)
    return () => ipcRenderer.removeListener('capture:complete', handler)
  },

  // ─── Settings ────────────────────────────────────────────
  getSettings: (): Promise<Record<string, unknown>> => ipcRenderer.invoke('settings:get'),
  setSettings: (settings: Record<string, unknown>): Promise<void> =>
    ipcRenderer.invoke('settings:set', settings),
  getApiKey: (provider: string): Promise<string> =>
    ipcRenderer.invoke('settings:get-api-key', provider),
  setApiKey: (provider: string, key: string): Promise<void> =>
    ipcRenderer.invoke('settings:set-api-key', provider, key),

  // ─── Shortcuts ───────────────────────────────────────────
  updateShortcut: (shortcut: string): Promise<boolean> =>
    ipcRenderer.invoke('shortcut:update', shortcut),
  getCurrentShortcut: (): Promise<string | null> => ipcRenderer.invoke('shortcut:get-current'),

  // ─── Window Controls ────────────────────────────────────
  minimize: (): void => ipcRenderer.send('window:minimize'),
  maximize: (): void => ipcRenderer.send('window:maximize'),
  close: (): void => ipcRenderer.send('window:close'),
  isMaximized: (): Promise<boolean> => ipcRenderer.invoke('window:is-maximized'),

  // ─── Overlay ─────────────────────────────────────────────
  createOverlay: (): Promise<void> => ipcRenderer.invoke('overlay:create'),
  closeOverlay: (): void => ipcRenderer.send('overlay:close'),

  // ─── Privacy ─────────────────────────────────────────────
  cleanup: (): Promise<void> => ipcRenderer.invoke('privacy:cleanup'),

  // ─── App Info ────────────────────────────────────────────
  getVersion: (): Promise<string> => ipcRenderer.invoke('app:version'),
  getPlatform: (): Promise<string> => ipcRenderer.invoke('app:platform'),
  getElectronVersion: (): Promise<string> => ipcRenderer.invoke('app:electron-version'),
  getChromeVersion: (): Promise<string> => ipcRenderer.invoke('app:chrome-version'),
  getNodeVersion: (): Promise<string> => ipcRenderer.invoke('app:node-version'),

  // ─── Navigation ──────────────────────────────────────────
  onNavigate: (callback: (path: string) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, path: string): void => callback(path)
    ipcRenderer.on('navigate', handler)
    return () => ipcRenderer.removeListener('navigate', handler)
  },

  // ─── Updates ─────────────────────────────────────────────
  onUpdateAvailable: (callback: (info: Record<string, unknown>) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, info: Record<string, unknown>): void =>
      callback(info)
    ipcRenderer.on('update:available', handler)
    return () => ipcRenderer.removeListener('update:available', handler)
  }
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)

export type ElectronAPI = typeof electronAPI
