import { forwardRef, HTMLAttributes, ReactNode } from 'react'
import { clsx } from 'clsx'
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react'
import styles from './Alert.module.css'

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'success' | 'error' | 'warning' | 'info'
  title?: string
  children: ReactNode
  dismissible?: boolean
  onDismiss?: () => void
}

const Alert = forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      className,
      variant = 'info',
      title,
      children,
      dismissible = false,
      onDismiss,
      ...props
    },
    ref,
  ) => {
    const variants = {
      success: { icon: CheckCircle, container: styles.success },
      error: { icon: AlertCircle, container: styles.error },
      warning: { icon: AlertTriangle, container: styles.warning },
      info: { icon: Info, container: styles.info },
    }

    const { icon: Icon, container } = variants[variant]

    return (
      <div
        ref={ref}
        className={clsx(
          styles.alert,
          container,
          dismissible && styles.dismissible,
          className,
        )}
        {...props}
      >
        <Icon className={styles.alertIcon} />
        <div className={styles.alertContent}>
          {title && <h3 className={styles.alertTitle}>{title}</h3>}
          <div className={styles.alertMessage}>{children}</div>
        </div>
        {dismissible && (
          <button
            type="button"
            className={styles.alertDismiss}
            onClick={onDismiss}
            aria-label="Fechar alerta"
          >
            <X />
          </button>
        )}
      </div>
    )
  },
)

Alert.displayName = 'Alert'

export default Alert
