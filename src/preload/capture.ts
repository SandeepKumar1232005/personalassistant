import { contextBridge, ipcRenderer } from 'electron'

const captureAPI = {
  sendRegion: (region: { x: number; y: number; width: number; height: number }): void => {
    ipcRenderer.send('capture:region-selected', region)
  },
  cancelCapture: (): void => {
    ipcRenderer.send('capture:cancel')
  }
}

contextBridge.exposeInMainWorld('captureAPI', captureAPI)

export type CaptureAPI = typeof captureAPI
