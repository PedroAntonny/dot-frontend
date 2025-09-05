import { forwardRef, InputHTMLAttributes } from 'react'
import { clsx } from 'clsx'
import styles from './Checkbox.module.css'

export interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const checkboxId =
      id || `checkbox-${Math.random().toString(36).substr(2, 9)}`

    const toggleCheckbox = () => {
      const input = document.getElementById(checkboxId) as HTMLInputElement
      if (input) {
        const newChecked = !input.checked
        input.checked = newChecked

        if (props.onChange) {
          const syntheticEvent = {
            target: input,
            currentTarget: input,
            checked: newChecked,
            type: 'change',
            bubbles: true,
            cancelable: true,
            defaultPrevented: false,
            eventPhase: 2,
            isTrusted: false,
            nativeEvent: new Event('change'),
            preventDefault: () => {},
            stopPropagation: () => {},
            isDefaultPrevented: () => false,
            isPropagationStopped: () => false,
            persist: () => {},
            timeStamp: Date.now(),
          } as React.ChangeEvent<HTMLInputElement>

          props.onChange(syntheticEvent)
        }
      }
    }

    const handleCustomCheckboxClick = (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      toggleCheckbox()
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        toggleCheckbox()
      }
    }

    return (
      <div className={styles.checkboxGroup}>
        <div className={styles.checkboxWrapper}>
          <input
            type="checkbox"
            id={checkboxId}
            className={clsx(styles.checkboxInput, className)}
            ref={ref}
            {...props}
          />
          <div
            className={clsx(styles.checkboxCustom, {
              [styles.checked]: props.checked,
            })}
            onClick={handleCustomCheckboxClick}
            role="checkbox"
            aria-checked={props.checked}
            tabIndex={0}
            onKeyDown={handleKeyDown}
          ></div>
          {label && (
            <label htmlFor={checkboxId} className={styles.checkboxLabel}>
              {label}
            </label>
          )}
        </div>
        {error && <p className={styles.errorMessage}>{error}</p>}
        {helperText && !error && (
          <p className={styles.helpText}>{helperText}</p>
        )}
      </div>
    )
  },
)

Checkbox.displayName = 'Checkbox'

export default Checkbox
