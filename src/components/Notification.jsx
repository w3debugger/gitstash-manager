import React from 'react'
import classNames from 'classnames'
import { useApp } from '../context/AppContext'

function Notification() {
  const { notification, clearNotification } = useApp()

  if (!notification) return null

  const { message, type } = notification

  return (
    <div 
      className={classNames(
        'fixed top-5 right-5 py-4 px-6 text-white font-bold',
        'z-[1000] transform translate-x-96 transition-transform duration-300',
        'shadow-lg cursor-pointer',
        {
          'bg-green-600': type === 'success',
          'bg-red-600': type === 'error',
          'bg-blue-500': type === 'info',
          'bg-gray-600': !['success', 'error', 'info'].includes(type),
          'translate-x-0': notification
        }
      )}
      onClick={clearNotification}
      data-id="notification"
      data-type={type}
    >
      {message}
    </div>
  )
}

export default Notification