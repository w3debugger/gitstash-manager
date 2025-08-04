import React from 'react'
import classNames from 'classnames'

const Header = () => {
  return (
    <header
      className={classNames(
        'h-10',
        'flex items-center justify-center',
        'bg-surface-variant',
        'border-b border-border',
        'px-4',
        'app-drag',
      )}
    >
      GitStash Manager
    </header>
  )
}

export default Header
