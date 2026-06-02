import { useState, useEffect } from 'react'
import { Info, Shield, CheckCircle, Monitor, Cpu, Globe } from 'lucide-react'

interface SystemInfo {
  version: string
  electronVersion: string
  chromeVersion: string
  nodeVersion: string
  platform: string
}

export function AboutPage(): JSX.Element {
  const [systemInfo, setSystemInfo] = useState<SystemInfo>({
    version: '...',
    electronVersion: '...',
    chromeVersion: '...',
    nodeVersion: '...',
    platform: '...'
  })

  useEffect(() => {
    const loadInfo = async (): Promise<void> => {
      try {
        const [version, electronVersion, chromeVersion, nodeVersion, platform] = await Promise.all([
          window.electronAPI.getVersion(),
          window.electronAPI.getElectronVersion(),
          window.electronAPI.getChromeVersion(),
          window.electronAPI.getNodeVersion(),
          window.electronAPI.getPlatform()
        ])
        setSystemInfo({ version, electronVersion, chromeVersion, nodeVersion, platform })
      } catch {
        // Use defaults
      }
    }
    loadInfo()
  }, [])

  return (
    <div className="page about-page">
      {/* Hero */}
      <div className="about-hero">
        <div className="about-logo">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
            <defs>
              <linearGradient id="aboutLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#c084fc" />
              </linearGradient>
            </defs>
            <rect x="3" y="3" width="18" height="18" rx="4" stroke="url(#aboutLogoGrad)" strokeWidth="2" />
            <circle cx="12" cy="12" r="3" fill="url(#aboutLogoGrad)" />
            <path d="M12 3v4M12 17v4M3 12h4M17 12h4" stroke="url(#aboutLogoGrad)" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <h1 className="about-title">SnapAssist AI</h1>
        <p className="about-version">Version {systemInfo.version}</p>
        <p className="about-tagline">AI-powered desktop overlay assistant for screenshot analysis</p>
      </div>

      {/* System Info */}
      <section className="about-section">
        <h2 className="about-section-title">
          <Monitor size={18} /> System Information
        </h2>
        <div className="about-info-grid">
          <div className="about-info-item">
            <span className="about-info-label">Platform</span>
            <span className="about-info-value">{systemInfo.platform}</span>
          </div>
          <div className="about-info-item">
            <span className="about-info-label">Electron</span>
            <span className="about-info-value">{systemInfo.electronVersion}</span>
          </div>
          <div className="about-info-item">
            <span className="about-info-label">Chrome</span>
            <span className="about-info-value">{systemInfo.chromeVersion}</span>
          </div>
          <div className="about-info-item">
            <span className="about-info-label">Node.js</span>
            <span className="about-info-value">{systemInfo.nodeVersion}</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="about-section">
        <h2 className="about-section-title">
          <Cpu size={18} /> Key Features
        </h2>
        <div className="about-features">
          {[
            { icon: '📸', title: 'Smart Capture', desc: 'Region-based screenshot with multi-monitor support' },
            { icon: '🤖', title: 'Multi-Provider AI', desc: 'OpenAI, Anthropic, Gemini, and custom APIs' },
            { icon: '💬', title: 'Follow-Up Chat', desc: 'Continue conversations about your screenshots' },
            { icon: '🔒', title: 'Privacy First', desc: 'No screenshots stored, auto-cleanup, encrypted keys' },
            { icon: '🎨', title: 'Modern UI', desc: 'Glassmorphism design with dark/light themes' },
            { icon: '⚡', title: 'Fast & Light', desc: 'Under 500ms overlay launch, streaming responses' }
          ].map((feature) => (
            <div key={feature.title} className="about-feature-card">
              <span className="about-feature-icon">{feature.icon}</span>
              <div>
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Privacy */}
      <section className="about-section">
        <h2 className="about-section-title">
          <Shield size={18} /> Privacy Promise
        </h2>
        <div className="about-privacy">
          {[
            'Screenshots are never permanently stored',
            'No document indexing or search history',
            'API keys encrypted with OS-level security',
            'Session data cleared when you close the window',
            'No telemetry or usage tracking'
          ].map((item) => (
            <div key={item} className="about-privacy-item">
              <CheckCircle size={16} className="text-emerald-400" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
