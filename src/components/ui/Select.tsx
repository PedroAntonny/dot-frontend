import { forwardRef, SelectHTMLAttributes } from 'react'
import { clsx } from 'clsx'
import styles from './Select.module.css'

export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  helperText?: string
  options: SelectOption[]
  placeholder?: string
  variant?: 'default' | 'enrollment' | 'modal'
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      options,
      placeholder,
      id,
      variant = 'default',
      ...props
    },
    ref,
  ) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`

    return (
      <div className={styles.selectGroup}>
        {label && (
          <label
            htmlFor={selectId}
            className={clsx(
              variant === 'enrollment' ? styles.enrollmentLabel : styles.label,
            )}
          >
            {label}
          </label>
        )}
        <div className={styles.selectWrapper}>
          <select
            id={selectId}
            className={clsx(
              styles.select,
              variant === 'enrollment' && styles.enrollmentStyle,
              variant === 'modal' && styles.modalStyle,
              error && styles.error,
              className,
            )}
            ref={ref}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        {error && (
          <p
            className={clsx(
              variant === 'enrollment' || variant === 'modal'
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

Select.displayName = 'Select'

export default Select
