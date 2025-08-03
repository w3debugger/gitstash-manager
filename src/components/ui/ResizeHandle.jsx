import { use } from 'react'
import classNames from 'classnames'
import { AppContext } from '../../context/AppContext'

const ResizeHandle = ({ 
  type,
  minWidth = 200,
  maxWidth = 500,
  title = "Drag to resize",
  dataId,
  className
}) => {
  const { columns, setColumnWidth } = use(AppContext)
  
  const handleMouseDown = (e) => {
    const startX = e.clientX
    const startWidth = columns[type]
    if (!startWidth) return

    e.preventDefault()
    
    let animationId
    
    const handleMouseMove = (e) => {
      if (animationId) return
      
      animationId = requestAnimationFrame(() => {
        const newWidth = Math.max(minWidth, Math.min(maxWidth, startWidth + e.clientX - startX))
        setColumnWidth(type, newWidth)
        animationId = null
      })
    }

    const handleMouseUp = () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
      document.removeEventListener('mousemove', handleMouseMove, { passive: true })
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove, { passive: true })
    document.addEventListener('mouseup', handleMouseUp)
  }

  return (
    <div 
      className={classNames(
        'absolute top-0 bottom-0 right-0 w-px z-[10000] cursor-col-resize select-none',
        className
      )}
      onMouseDown={handleMouseDown}
      title={title}
      data-id={dataId}
    />
  )
}

export default ResizeHandle