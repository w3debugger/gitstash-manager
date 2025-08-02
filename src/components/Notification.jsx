import React from 'react'
import { useApp } from '../context/AppContext'

function Notification() {
  const { notification, clearNotification } = useApp()

  if (!notification) return null

  const { message, type } = notification

  return (
    <div 
      className={`notification ${type}`}
      onClick={clearNotification}
    >
      {message}
    </div>
  )
}

export default Notification