import React from 'react'
import { useApp } from '../context/AppContext'

function Notification() {
  const { notification, clearNotification } = useApp()

  if (!notification) return null

  const { message, type } = notification

  return (
    <div 
      className={`fixed top-5 right-5 py-4 px-6 rounded-lg text-white font-bold z-[1000] transform translate-x-96 transition-transform duration-300 shadow-lg cursor-pointer ${
        type === 'success' ? 'bg-green-600' : 
        type === 'error' ? 'bg-red-600' : 
        type === 'info' ? 'bg-blue-500' : 'bg-gray-600'
      } ${notification ? 'translate-x-0' : ''}`}
      onClick={clearNotification}
      data-id="notification"
      data-type={type}
    >
      {message}
    </div>
  )
}

export default Notification