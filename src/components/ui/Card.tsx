import { forwardRef, HTMLAttributes, ReactNode } from 'react'
import { clsx } from 'clsx'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  padding?: 'sm' | 'md' | 'lg'
  shadow?: 'sm' | 'md' | 'lg' | 'none'
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, padding = 'md', shadow = 'md', ...props }, ref) => {
    const paddingClasses = {
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    }

    const shadowClasses = {
      sm: 'shadow-sm',
      md: 'shadow-md',
      lg: 'shadow-lg',
      none: '',
    }

    return (
      <div
        ref={ref}
        className={clsx(
          'bg-white rounded-lg border border-gray-200',
          paddingClasses[padding],
          shadowClasses[shadow],
          className,
        )}
        {...props}
      >
        {children}
      </div>
    )
  },
)

Card.displayName = 'Card'

export default Card
