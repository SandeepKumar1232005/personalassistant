import { X, CheckCircle, XCircle, Info } from 'lucide-react'
import { cn } from '@lib/utils'

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

interface ToastContainerProps {
  toasts: Toast[]
  onDismiss: (id: string) => void
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps): JSX.Element {
  if (toasts.length === 0) return <></>

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={cn('toast', `toast-${toast.type}`)}>
          <div className="toast-icon">
            {toast.type === 'success' && <CheckCircle size={16} />}
            {toast.type === 'error' && <XCircle size={16} />}
            {toast.type === 'info' && <Info size={16} />}
          </div>
          <span className="toast-message">{toast.message}</span>
          <button className="toast-close" onClick={() => onDismiss(toast.id)}>
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}
