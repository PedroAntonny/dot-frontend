import { forwardRef, InputHTMLAttributes } from 'react'
import { clsx } from 'clsx'
import styles from './Input.module.css'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  variant?: 'default' | 'enrollment' | 'modal'
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      label,
      error,
      helperText,
      id,
      variant = 'default',
      ...props
    },
    ref,
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`

    return (
      <div className={styles.inputGroup}>
        {label && (
          <label
            htmlFor={inputId}
            className={clsx(
              variant === 'enrollment' ? styles.enrollmentLabel : styles.label,
            )}
          >
            {label}
          </label>
        )}
        <div className={styles.inputWrapper}>
          <input
            type={type}
            id={inputId}
            className={clsx(
              styles.input,
              variant === 'enrollment' && styles.enrollmentStyle,
              variant === 'modal' && styles.modalStyle,
              error && styles.error,
              className,
            )}
            ref={ref}
            {...props}
          />
        </div>
        {error && (
          <p
            className={clsx(
              variant === 'enrollment'
                ? styles.enrollmentError
                : styles.errorMessage,
            )}
          >
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className={styles.helpText}>{helperText}</p>
        )}
      </div>
    )
  },
)

Input.displayName = 'Input'

export default Input
