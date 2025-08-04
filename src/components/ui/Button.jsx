import React from 'react'
import classNames from 'classnames'

const Button = ({ 
  children, 
  variant = 'primary', 
  disabled = false, 
  onClick, 
  className,
  ...props 
}) => {  
  const variants = {
    primary: 'bg-primary text-on-primary border-primary hover:bg-primary/80',
    secondary: 'bg-surface-variant text-on-surface border-border hover:bg-hover',
    outline: 'bg-transparent text-on-surface border-border hover:bg-hover',
    ghost: 'bg-transparent text-on-surface border-transparent hover:bg-hover',
  }

  return (
    <button
      className={classNames(
        'inline-flex px-2 py-1 text-xs items-center justify-center uppercase cursor-pointer border',
        variants[variant],
        disabled && 'opacity-50 cursor-not-allowed hover:transform-none hover:shadow-none' ,
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