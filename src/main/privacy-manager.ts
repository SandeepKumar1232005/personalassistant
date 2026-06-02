import { app } from 'electron'
import { join } from 'path'
import { existsSync, readdirSync, unlinkSync, statSync } from 'fs'

export class PrivacyManager {
  private cleanupTimer: NodeJS.Timeout | null = null
  private autoDeleteTimerMs = 30000 // 30 seconds default

  constructor() {
    this.startAutoCleanup()
  }

  setAutoDeleteTimer(seconds: number): void {
    this.autoDeleteTimerMs = seconds * 1000
    this.startAutoCleanup()
  }

  private startAutoCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
    }

    this.cleanupTimer = setInterval(() => {
      this.cleanupTempFiles()
    }, this.autoDeleteTimerMs)
  }

  cleanupTempFiles(): void {
    try {
      const tempDir = app.getPath('temp')
      const snapAssistTemp = join(tempDir, 'snapassist')

      if (existsSync(snapAssistTemp)) {
        const files = readdirSync(snapAssistTemp)
        const now = Date.now()

        for (const file of files) {
          const filePath = join(snapAssistTemp, file)
          try {
            const stat = statSync(filePath)
            // Delete files older than autoDeleteTimer
            if (now - stat.mtimeMs > this.autoDeleteTimerMs) {
              unlinkSync(filePath)
              console.log('[PrivacyManager] Deleted temp file:', file)
            }
          } catch {
            // File may have already been deleted
          }
        }
      }
    } catch (error) {
      console.error('[PrivacyManager] Cleanup error:', error)
    }
  }

  cleanupAll(): void {
    this.cleanupTempFiles()

    // Force garbage collection hint
    if (global.gc) {
      global.gc()
    }

    console.log('[PrivacyManager] Full cleanup completed')
  }

  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = null
    }
    this.cleanupAll()
  }
}
