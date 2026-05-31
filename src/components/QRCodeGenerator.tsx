import { useEffect, useRef } from 'react'
import QRCode from 'qrcode'

interface QRCodeGeneratorProps {
  value: string
  size?: number
  className?: string
}

export function QRCodeGenerator({ value, size = 256, className = '' }: QRCodeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current && value) {
      QRCode.toCanvas(
        canvasRef.current,
        value,
        {
          width: size,
          margin: 2,
          color: {
            dark: '#1a1a2e',
            light: '#ffffff',
          },
        },
        (error) => {
          if (error) console.error('QR Code generation error:', error)
        }
      )
    }
  }, [value, size])

  if (!value) {
    return (
      <div
        className={`flex items-center justify-center bg-muted rounded-lg ${className}`}
        style={{ width: size, height: size }}
      >
        <p className="text-muted-foreground text-sm text-center px-4">No code available</p>
      </div>
    )
  }

  return <canvas ref={canvasRef} className={className} />
}
