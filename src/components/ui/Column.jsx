import classNames from 'classnames'
import { useApp } from '../../context/AppContext'
import ResizeHandle from './ResizeHandle'

function Column({ type, children }) {
  const { columns } = useApp()
  const columnWidth = columns?.[type] || 100

  return (
    <div
      style={{ width: `${columnWidth}px` }}
      data-id={`${type}-column`}
      className={classNames(
        'flex flex-col',
        'border-r border-border',
        'overflow-visible',
        'relative',
      )}
    >
      {children}

      <ResizeHandle
        type={type}
        title={`Drag to resize ${type} column`}
        dataId={`${type}-resize-handle`}
      />
    </div>
  )
}

export default Column
