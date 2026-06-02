import { useState } from 'react'
import { Shield, Key, Palette, Keyboard, Sliders, Cpu, CheckCircle, XCircle, Loader2, Eye, EyeOff } from 'lucide-react'
import { useSettingsStore } from '@stores/settings-store'
import { useUIStore } from '@stores/ui-store'
import { PROVIDER_MODELS, PROVIDER_ENDPOINTS } from '@typings/settings'
import { APP_MODE_LABELS, APP_MODE_DESCRIPTIONS, APP_MODE_ICONS } from '@typings/ai'
import type { ProviderType, AppMode } from '@typings/ai'
import { cn } from '@lib/utils'

export function SettingsPage(): JSX.Element {
  const settings = useSettingsStore()
  const { addToast } = useUIStore()
  const [apiKeyInput, setApiKeyInput] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)
  const [isTestingKey, setIsTestingKey] = useState(false)
  const [keyStatus, setKeyStatus] = useState<'idle' | 'valid' | 'invalid'>('idle')

  const handleSaveApiKey = async (): Promise<void> => {
    if (!apiKeyInput.trim()) return
    try {
      await window.electronAPI.setApiKey(settings.provider, apiKeyInput.trim())
      addToast('API key saved successfully', 'success')
      setApiKeyInput('')
      setKeyStatus('idle')
    } catch {
      addToast('Failed to save API key', 'error')
    }
  }

  const handleTestConnection = async (): Promise<void> => {
    setIsTestingKey(true)
    setKeyStatus('idle')
    try {
      const key = apiKeyInput.trim() || (await window.electronAPI.getApiKey(settings.provider))
      if (!key) {
        setKeyStatus('invalid')
        addToast('No API key to test', 'error')
        return
      }

      // Simple validation via provider-specific endpoint
      const { createProvider } = await import('@services/ai/provider-factory')
      const provider = createProvider({
        type: settings.provider,
        apiKey: key,
        model: settings.model,
        endpoint: settings.apiEndpoint
      })

      const valid = await provider.validateApiKey(key)
      setKeyStatus(valid ? 'valid' : 'invalid')
      addToast(valid ? 'Connection successful!' : 'Connection failed — check your API key', valid ? 'success' : 'error')
    } catch {
      setKeyStatus('invalid')
      addToast('Connection test failed', 'error')
    } finally {
      setIsTestingKey(false)
    }
  }



  return (
    <div className="page settings-page">
      <h1 className="settings-title">Settings</h1>

      {/* AI Provider */}
      <section className="settings-section">
        <div className="settings-section-header">
          <Cpu size={20} />
          <h2>AI Provider</h2>
        </div>

        <div className="settings-field">
          <label>Provider</label>
          <div className="settings-input" style={{ opacity: 0.7, pointerEvents: 'none' }}>
            Google Gemini
          </div>
        </div>

        <div className="settings-field">
          <label>Model</label>
          {PROVIDER_MODELS[settings.provider].length > 0 ? (
            <select
              className="settings-select"
              value={settings.model}
              onChange={(e) => settings.updateSettings({ model: e.target.value })}
            >
              {PROVIDER_MODELS[settings.provider].map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          ) : (
            <input
              className="settings-input"
              value={settings.model}
              onChange={(e) => settings.updateSettings({ model: e.target.value })}
              placeholder="Enter model name"
            />
          )}
        </div>

        <div className="settings-field">
          <label>API Endpoint</label>
          <input
            className="settings-input"
            value={settings.apiEndpoint}
            onChange={(e) => settings.updateSettings({ apiEndpoint: e.target.value })}
            placeholder="API base URL"
          />
        </div>

        <div className="settings-field">
          <label>API Key</label>
          <div className="settings-api-key-row">
            <div className="settings-input-wrapper">
              <input
                className="settings-input"
                type={showApiKey ? 'text' : 'password'}
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="Enter your API key"
              />
              <button className="settings-eye-btn" onClick={() => setShowApiKey(!showApiKey)}>
                {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <button className="settings-btn" onClick={handleSaveApiKey} disabled={!apiKeyInput.trim()}>
              <Key size={14} />
              Save
            </button>
            <button
              className="settings-btn settings-btn-secondary"
              onClick={handleTestConnection}
              disabled={isTestingKey}
            >
              {isTestingKey ? (
                <Loader2 size={14} className="animate-spin" />
              ) : keyStatus === 'valid' ? (
                <CheckCircle size={14} className="text-emerald-400" />
              ) : keyStatus === 'invalid' ? (
                <XCircle size={14} className="text-red-400" />
              ) : null}
              Test
            </button>
          </div>
        </div>
      </section>

      {/* Appearance */}
      <section className="settings-section">
        <div className="settings-section-header">
          <Palette size={20} />
          <h2>Appearance</h2>
        </div>

        <div className="settings-field">
          <label>Theme</label>
          <div className="settings-theme-group">
            {(['light', 'dark', 'system'] as const).map((t) => (
              <button
                key={t}
                className={cn('settings-theme-btn', settings.theme === t && 'active')}
                onClick={() => settings.setTheme(t)}
              >
                {t === 'light' ? '☀️' : t === 'dark' ? '🌙' : '💻'} {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Shortcut */}
      <section className="settings-section">
        <div className="settings-section-header">
          <Keyboard size={20} />
          <h2>Keyboard Shortcut</h2>
        </div>
        <div className="settings-field">
          <label>Global Capture Shortcut</label>
          <div className="settings-shortcut-display">
            <kbd>{settings.shortcut.replace('CommandOrControl', 'Ctrl').replace(/\+/g, ' + ')}</kbd>
          </div>
          <p className="settings-hint">Press this combination anywhere to start a screen capture</p>
        </div>
      </section>

      {/* Capture */}
      <section className="settings-section">
        <div className="settings-section-header">
          <Sliders size={20} />
          <h2>Capture Settings</h2>
        </div>
        <div className="settings-field">
          <label>Screenshot Quality: {Math.round(settings.screenshotQuality * 100)}%</label>
          <input
            className="settings-range"
            type="range"
            min="0.1"
            max="1"
            step="0.05"
            value={settings.screenshotQuality}
            onChange={(e) => settings.updateSettings({ screenshotQuality: parseFloat(e.target.value) })}
          />
        </div>
      </section>

      {/* Privacy */}
      <section className="settings-section">
        <div className="settings-section-header">
          <Shield size={20} />
          <h2>Privacy</h2>
        </div>
        <div className="settings-field">
          <label className="settings-toggle-row">
            <span>Privacy Mode</span>
            <button
              className={cn('settings-toggle', settings.privacyMode && 'active')}
              onClick={() => settings.updateSettings({ privacyMode: !settings.privacyMode })}
            >
              <div className="settings-toggle-knob" />
            </button>
          </label>
          <p className="settings-hint">When enabled, screenshots are never saved and session data is cleared immediately</p>
        </div>
        <div className="settings-field">
          <label>Auto-Delete Timer: {settings.autoDeleteTimer}s</label>
          <input
            className="settings-range"
            type="range"
            min="5"
            max="300"
            step="5"
            value={settings.autoDeleteTimer}
            onChange={(e) => settings.updateSettings({ autoDeleteTimer: parseInt(e.target.value) })}
          />
        </div>
        <button
          className="settings-btn settings-btn-danger"
          onClick={async () => {
            await window.electronAPI.cleanup()
            addToast('All temporary data cleared', 'success')
          }}
        >
          Clear All Data
        </button>
      </section>

      {/* Application Mode */}
      <section className="settings-section">
        <div className="settings-section-header">
          <Sliders size={20} />
          <h2>Application Mode</h2>
        </div>
        <div className="settings-mode-list">
          {(Object.keys(APP_MODE_LABELS) as AppMode[]).map((mode) => (
            <button
              key={mode}
              className={cn('settings-mode-item', settings.appMode === mode && 'active')}
              onClick={() => settings.setAppMode(mode)}
            >
              <span className="settings-mode-icon">{APP_MODE_ICONS[mode]}</span>
              <div className="settings-mode-text">
                <span className="settings-mode-name">{APP_MODE_LABELS[mode]}</span>
                <span className="settings-mode-desc">{APP_MODE_DESCRIPTIONS[mode]}</span>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
