import { useRef, useState, useEffect, useCallback } from 'react'

declare global {
  interface Window {
    captureAPI: {
      sendRegion: (region: { x: number; y: number; width: number; height: number }) => void
      cancelCapture: () => void
    }
  }
}

interface SelectionRegion {
  startX: number
  startY: number
  endX: number
  endY: number
}

export function CaptureApp(): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isSelecting, setIsSelecting] = useState(false)
  const [selection, setSelection] = useState<SelectionRegion | null>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    if (selection) {
      const x = Math.min(selection.startX, selection.endX)
      const y = Math.min(selection.startY, selection.endY)
      const w = Math.abs(selection.endX - selection.startX)
      const h = Math.abs(selection.endY - selection.startY)

      // Clear selection area (show through)
      ctx.clearRect(x, y, w, h)

      // Selection border
      ctx.strokeStyle = '#818cf8'
      ctx.lineWidth = 2
      ctx.setLineDash([])
      ctx.strokeRect(x, y, w, h)

      // Corner handles
      const handleSize = 8
      ctx.fillStyle = '#818cf8'
      const corners = [
        [x, y],
        [x + w, y],
        [x, y + h],
        [x + w, y + h]
      ]
      corners.forEach(([cx, cy]) => {
        ctx.fillRect(cx - handleSize / 2, cy - handleSize / 2, handleSize, handleSize)
      })


    } else {
      // Crosshair
      ctx.strokeStyle = 'rgba(129, 140, 248, 0.5)'
      ctx.lineWidth = 1
      ctx.setLineDash([6, 4])

      // Horizontal line
      ctx.beginPath()
      ctx.moveTo(0, mousePos.y)
      ctx.lineTo(canvas.width, mousePos.y)
      ctx.stroke()

      // Vertical line
      ctx.beginPath()
      ctx.moveTo(mousePos.x, 0)
      ctx.lineTo(mousePos.x, canvas.height)
      ctx.stroke()
    }
  }, [selection, mousePos])

  // Setup canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }, [])

  // Draw loop
  useEffect(() => {
    draw()
  }, [draw])

  // Keyboard handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        window.captureAPI.cancelCapture()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleMouseDown = (e: React.MouseEvent): void => {
    // Right click cancels capture
    if (e.button === 2) {
      window.captureAPI.cancelCapture()
      return
    }

    setIsSelecting(true)
    setSelection({
      startX: e.clientX,
      startY: e.clientY,
      endX: e.clientX,
      endY: e.clientY
    })
  }

  const handleMouseMove = (e: React.MouseEvent): void => {
    setMousePos({ x: e.clientX, y: e.clientY })

    if (isSelecting && selection) {
      setSelection({
        ...selection,
        endX: e.clientX,
        endY: e.clientY
      })
    }
  }

  const handleMouseUp = (): void => {
    if (!isSelecting || !selection) return
    setIsSelecting(false)

    const x = Math.min(selection.startX, selection.endX)
    const y = Math.min(selection.startY, selection.endY)
    const width = Math.abs(selection.endX - selection.startX)
    const height = Math.abs(selection.endY - selection.startY)

    // Single click (or very small selection) takes full screen screenshot
    if (width < 10 || height < 10) {
      window.captureAPI.sendRegion({
        x: 0,
        y: 0,
        width: window.innerWidth,
        height: window.innerHeight
      })
      return
    }

    window.captureAPI.sendRegion({ x, y, width, height })
  }

  return (
    <canvas
      ref={canvasRef}
      className="capture-canvas"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onContextMenu={(e) => e.preventDefault()}
    />
  )
}
