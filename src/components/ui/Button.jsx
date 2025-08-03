import React from 'react'
import classNames from 'classnames'

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false, 
  onClick, 
  className,
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-300 cursor-pointer border'
  
  const variants = {
    primary: 'bg-primary text-on-primary border-primary hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5',
    secondary: 'bg-surface-variant text-on-surface border-border hover:bg-hover',
    outline: 'bg-transparent text-on-surface border-border hover:bg-hover',
    ghost: 'bg-transparent text-on-surface border-transparent hover:bg-hover',
  }
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg',
  }
  
  const disabledClasses = disabled 
    ? 'opacity-50 cursor-not-allowed hover:transform-none hover:shadow-none' 
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
      {...props}
    >
      {children}
    </button>
  )
}

export default Button