import React from 'react'
import classNames from 'classnames'

const IconButton = ({ 
  children, 
  size = 'md', 
  variant = 'ghost',
  disabled = false, 
  onClick, 
  className,
  title,
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center transition-all duration-200 cursor-pointer border border-transparent'
  
  const variants = {
    ghost: 'text-on-surface hover:bg-hover',
    filled: 'bg-surface-variant text-on-surface hover:bg-hover',
    inverse: 'text-on-primary hover:bg-on-primary/10',
  }
  
  const sizes = {
    sm: 'w-6 h-6 text-sm',
    md: 'w-8 h-8 text-base',
    lg: 'w-10 h-10 text-lg',
  }
  
  const disabledClasses = disabled 
    ? 'opacity-50 cursor-not-allowed hover:bg-transparent' 
    : ''

  return (
    <button
      className={classNames(
        baseClasses,
        variants[variant],
        sizes[size],
        disabledClasses,
        className
      )}
      disabled={disabled}
      onClick={onClick}
      title={title}
      {...props}
    >
      {children}
    </button>
  )
}

export default IconButton