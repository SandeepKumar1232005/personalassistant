import { desktopCapturer, screen, nativeImage, NativeImage } from 'electron'
import { WindowManager } from './window-manager'

interface CaptureRegion {
  x: number
  y: number
  width: number
  height: number
  displayId?: string
}

export class ScreenshotEngine {
  private windowManager: WindowManager
  private isCapturing = false
  private pendingResolve: ((value: string | null) => void) | null = null

  constructor(windowManager: WindowManager) {
    this.windowManager = windowManager
  }

  async startCapture(): Promise<void> {
    if (this.isCapturing) return

    this.isCapturing = true
    console.log('[ScreenshotEngine] Starting capture mode')

    try {
      // Create capture overlay windows on all displays
      this.windowManager.createCaptureWindows()
    } catch (error) {
      console.error('[ScreenshotEngine] Error starting capture:', error)
      this.isCapturing = false
    }
  }

  async captureRegion(region: CaptureRegion): Promise<string | null> {
    try {
      console.log('[ScreenshotEngine] Capturing region:', region)

      // Close capture windows immediately for clean screenshot
      this.windowManager.closeCaptureWindows()

      // Small delay to let windows close
      await new Promise((resolve) => setTimeout(resolve, 100))

      // Get all screen sources
      const sources = await desktopCapturer.getSources({
        types: ['screen'],
        thumbnailSize: this.getOptimalThumbnailSize(region)
      })

      if (sources.length === 0) {
        throw new Error('No screen sources available')
      }

      // Find the right source for the display
      let source = sources[0]
      if (region.displayId) {
        const match = sources.find((s) => s.display_id === region.displayId)
        if (match) source = match
      }

      // Get the thumbnail and crop to region
      const fullImage = source.thumbnail
      const croppedImage = this.cropImage(fullImage, region)

      if (!croppedImage) {
        throw new Error('Failed to crop image')
      }

      // Convert to base64 PNG
      const base64 = croppedImage.toDataURL()

      console.log('[ScreenshotEngine] Capture complete, image size:', base64.length)
      this.isCapturing = false

      return base64
    } catch (error) {
      console.error('[ScreenshotEngine] Capture error:', error)
      this.isCapturing = false
      return null
    }
  }

  async captureFullScreen(displayIndex = 0): Promise<string | null> {
    try {
      const displays = screen.getAllDisplays()
      const display = displays[displayIndex] || displays[0]

      const sources = await desktopCapturer.getSources({
        types: ['screen'],
        thumbnailSize: {
          width: display.size.width * display.scaleFactor,
          height: display.size.height * display.scaleFactor
        }
      })

      if (sources.length === 0) return null

      const source = sources.find((s) => s.display_id === String(display.id)) || sources[0]
      return source.thumbnail.toDataURL()
    } catch (error) {
      console.error('[ScreenshotEngine] Full screen capture error:', error)
      return null
    }
  }

  cancelCapture(): void {
    console.log('[ScreenshotEngine] Capture cancelled')
    this.windowManager.closeCaptureWindows()
    this.isCapturing = false

    if (this.pendingResolve) {
      this.pendingResolve(null)
      this.pendingResolve = null
    }
  }

  getIsCapturing(): boolean {
    return this.isCapturing
  }

  private cropImage(image: NativeImage, region: CaptureRegion): NativeImage | null {
    try {
      const size = image.getSize()

      // Find the display for scale factor calculation
      const displays = screen.getAllDisplays()
      const display = region.displayId
        ? displays.find((d) => String(d.id) === region.displayId)
        : displays[0]

      const scaleFactor = display?.scaleFactor || 1

      // Scale coordinates by display scale factor
      const cropRect = {
        x: Math.round(region.x * scaleFactor),
        y: Math.round(region.y * scaleFactor),
        width: Math.round(region.width * scaleFactor),
        height: Math.round(region.height * scaleFactor)
      }

      // Clamp to image bounds
      cropRect.x = Math.max(0, Math.min(cropRect.x, size.width - 1))
      cropRect.y = Math.max(0, Math.min(cropRect.y, size.height - 1))
      cropRect.width = Math.min(cropRect.width, size.width - cropRect.x)
      cropRect.height = Math.min(cropRect.height, size.height - cropRect.y)

      if (cropRect.width <= 0 || cropRect.height <= 0) {
        return null
      }

      return image.crop(cropRect)
    } catch (error) {
      console.error('[ScreenshotEngine] Crop error:', error)
      return null
    }
  }

  private getOptimalThumbnailSize(region: CaptureRegion): { width: number; height: number } {
    const displays = screen.getAllDisplays()
    const display = region.displayId
      ? displays.find((d) => String(d.id) === region.displayId)
      : displays[0]

    if (display) {
      return {
        width: display.size.width * display.scaleFactor,
        height: display.size.height * display.scaleFactor
      }
    }

    return { width: 1920, height: 1080 }
  }
}
