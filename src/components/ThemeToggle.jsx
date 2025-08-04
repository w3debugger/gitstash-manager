import { useState, useEffect, useCallback } from 'react'
import IconButton from './ui/IconButton'

const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme')
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)
  })

  const toggleTheme = useCallback(() => {
    const newIsDark = !isDark
    const theme = newIsDark ? 'dark' : 'light'
    
    setIsDark(newIsDark)
    localStorage.setItem('theme', theme)
    
    if (newIsDark) {
      document.documentElement.setAttribute('data-theme', 'dark')
    } else {
      document.documentElement.removeAttribute('data-theme')
    }
  }, [isDark])

  // Apply initial theme
  useEffect(() => {
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark')
    }
  }, [])

  return (
    <IconButton
      onClick={toggleTheme}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      variant="ghost"
      className="fixed bottom-4 right-4 z-50 p-2 rounded-xl"
    >
      {isDark ? '🌞' : '🌙'}
    </IconButton>
  )
}

export default ThemeToggle
