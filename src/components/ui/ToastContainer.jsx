import { useToast } from '../../context/ToastContext';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const ICONS = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="toast-container">
      {toasts.map(toast => {
        const Icon = ICONS[toast.type] || ICONS.info;
        return (
          <div
            key={toast.id}
            className={`toast toast-${toast.type} ${toast.exiting ? 'exiting' : ''}`}
          >
            <Icon className="toast-icon" size={18} />
            <span className="toast-message">{toast.message}</span>
            <X
              className="toast-close"
              size={16}
              onClick={() => removeToast(toast.id)}
            />
          </div>
        );
      })}
    </div>
  );
}
