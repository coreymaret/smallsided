// src/components/Toast/ToastContainer.tsx
import { Check, AlertCircle, X, Bell } from '../../components/Icons/Icons';
import type { Toast } from '../../hooks/useToast';
import styles from './ToastContainer.module.scss';

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

const ICONS = {
  success: Check,
  error:   AlertCircle,
  warning: AlertCircle,
  info:    Bell,
};

const ToastContainer = ({ toasts, onRemove }: ToastContainerProps) => {
  if (toasts.length === 0) return null;

  return (
    <div className={styles.container} aria-live="polite" aria-atomic="false">
      {toasts.map(toast => {
        const Icon = ICONS[toast.type];
        return (
          <div
            key={toast.id}
            className={`${styles.toast} ${styles[toast.type]}`}
            role="alert"
          >
            <Icon size={18} className={styles.icon} />
            <span className={styles.message}>{toast.message}</span>
            <button
              className={styles.close}
              onClick={() => onRemove(toast.id)}
              aria-label="Dismiss notification"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default ToastContainer;
