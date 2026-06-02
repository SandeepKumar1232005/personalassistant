import '@testing-library/jest-dom'

// Mock window.electronAPI for tests
Object.defineProperty(window, 'electronAPI', {
  value: {
    startCapture: vi.fn(),
    captureFullScreen: vi.fn(),
    onCaptureComplete: vi.fn(() => vi.fn()),
    getSettings: vi.fn(() => Promise.resolve({
      theme: 'dark',
      provider: 'openai',
      model: 'gpt-4o',
      apiEndpoint: 'https://api.openai.com/v1',
      shortcut: 'CommandOrControl+Shift+Space',
      screenshotQuality: 0.92,
      autoDeleteTimer: 30,
      appMode: 'quick-explain',
      privacyMode: true,
      language: 'en'
    })),
    setSettings: vi.fn(() => Promise.resolve()),
    getApiKey: vi.fn(() => Promise.resolve('')),
    setApiKey: vi.fn(() => Promise.resolve()),
    updateShortcut: vi.fn(() => Promise.resolve(true)),
    getCurrentShortcut: vi.fn(() => Promise.resolve('CommandOrControl+Shift+Space')),
    minimize: vi.fn(),
    maximize: vi.fn(),
    close: vi.fn(),
    isMaximized: vi.fn(() => Promise.resolve(false)),
    createOverlay: vi.fn(() => Promise.resolve()),
    closeOverlay: vi.fn(),
    cleanup: vi.fn(() => Promise.resolve()),
    getVersion: vi.fn(() => Promise.resolve('1.0.0')),
    getPlatform: vi.fn(() => Promise.resolve('win32')),
    getElectronVersion: vi.fn(() => Promise.resolve('36.0.0')),
    getChromeVersion: vi.fn(() => Promise.resolve('128.0.0')),
    getNodeVersion: vi.fn(() => Promise.resolve('20.0.0')),
    onNavigate: vi.fn(() => vi.fn()),
    onUpdateAvailable: vi.fn(() => vi.fn())
  },
  writable: true
})
