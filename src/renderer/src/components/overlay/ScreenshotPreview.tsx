import { Scan, ZoomIn, Sparkles } from 'lucide-react'
import { cn } from '@lib/utils'

interface ScreenshotPreviewProps {
  src: string
  compact?: boolean
  onAnalyze?: () => void
  isAnalyzing?: boolean
  mode?: string
}

export function ScreenshotPreview({
  src,
  compact,
  onAnalyze,
  isAnalyzing,
  mode
}: ScreenshotPreviewProps): JSX.Element {
  return (
    <div className={cn('screenshot-preview', compact && 'screenshot-preview-compact')}>
      <div className="screenshot-preview-image-wrapper">
        <img
          src={src}
          alt="Captured screenshot"
          className="screenshot-preview-image"
          draggable={false}
        />
        {isAnalyzing && (
          <div className="screenshot-preview-analyzing">
            <Sparkles size={20} className="animate-pulse" />
            <span>Analyzing...</span>
          </div>
        )}
      </div>

      {onAnalyze && !isAnalyzing && (
        <div className="screenshot-preview-actions">
          <button className="screenshot-analyze-btn" onClick={onAnalyze}>
            <Scan size={14} />
            <span>Analyze{mode ? ` — ${mode}` : ''}</span>
          </button>
        </div>
      )}
    </div>
  )
}
