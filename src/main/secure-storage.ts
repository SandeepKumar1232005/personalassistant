import { safeStorage } from 'electron'
import Store from 'electron-store'

interface AppSettings {
  theme: 'light' | 'dark' | 'system'
  provider: string
  model: string
  apiEndpoint: string
  shortcut: string
  screenshotQuality: number
  autoDeleteTimer: number
  appMode: string
  privacyMode: boolean
  language: string
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  provider: 'gemini',
  model: 'gemini-2.5-flash',
  apiEndpoint: 'https://generativelanguage.googleapis.com/v1beta',
  shortcut: 'CommandOrControl+Shift+Space',
  screenshotQuality: 0.92,
  autoDeleteTimer: 30,
  appMode: 'quick-explain',
  privacyMode: true,
  language: 'en'
}

export class SecureStorage {
  private store: Store

  constructor() {
    this.store = new Store({
      name: 'snapassist-config',
      encryptionKey: 'snapassist-ai-local-encryption-key',
      defaults: {
        settings: DEFAULT_SETTINGS,
        apiKeys: {}
      }
    })
  }

  // ─── Settings ────────────────────────────────────────────
  getSettings(): AppSettings {
    return this.store.get('settings', DEFAULT_SETTINGS) as AppSettings
  }

  setSettings(settings: Partial<AppSettings>): void {
    const current = this.getSettings()
    this.store.set('settings', { ...current, ...settings })
  }

  // ─── API Keys ────────────────────────────────────────────
  getApiKey(provider: string): string {
    // First check environment variables
    const envKey = this.getEnvApiKey(provider)
    if (envKey) return envKey

    // Then check secure storage
    try {
      const encryptedKeys = this.store.get('apiKeys', {}) as Record<string, string>
      const encrypted = encryptedKeys[provider]

      if (!encrypted) return ''

      if (safeStorage.isEncryptionAvailable()) {
        const buffer = Buffer.from(encrypted, 'base64')
        return safeStorage.decryptString(buffer)
      }

      // Fallback: stored in plain text (less secure)
      return encrypted
    } catch (error) {
      console.error('[SecureStorage] Error reading API key:', error)
      return ''
    }
  }

  setApiKey(provider: string, key: string): void {
    try {
      const encryptedKeys = this.store.get('apiKeys', {}) as Record<string, string>

      if (safeStorage.isEncryptionAvailable()) {
        const encrypted = safeStorage.encryptString(key)
        encryptedKeys[provider] = encrypted.toString('base64')
      } else {
        // Fallback: store in plain text
        encryptedKeys[provider] = key
      }

      this.store.set('apiKeys', encryptedKeys)
    } catch (error) {
      console.error('[SecureStorage] Error saving API key:', error)
    }
  }

  removeApiKey(provider: string): void {
    const encryptedKeys = this.store.get('apiKeys', {}) as Record<string, string>
    delete encryptedKeys[provider]
    this.store.set('apiKeys', encryptedKeys)
  }

  // ─── Environment Variable Fallback ───────────────────────
  private getEnvApiKey(provider: string): string {
    const envMap: Record<string, string> = {
      openai: 'OPENAI_API_KEY',
      anthropic: 'ANTHROPIC_API_KEY',
      gemini: 'GEMINI_API_KEY',
      google: 'GOOGLE_API_KEY'
    }

    const envVar = envMap[provider.toLowerCase()]
    if (envVar && process.env[envVar]) {
      return process.env[envVar]!
    }

    return ''
  }

  // ─── Clear All ───────────────────────────────────────────
  clearAll(): void {
    this.store.clear()
  }
}
