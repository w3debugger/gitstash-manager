import classNames from 'classnames'
import { use, useCallback, useMemo } from 'react'
import { AppContext } from '../context/AppContext'

const FilesPanel = () => {
  const { 
    selectedRepository, 
    selectedStash, 
    files,
    selectedFile, 
    setSelectedFile
  } = use(AppContext)

  // Memoized visibility check
  const shouldShow = useMemo(() => 
    selectedRepository && selectedStash !== null, 
    [selectedRepository, selectedStash]
  )

  // Optimized file selection
  const selectFile = useCallback((file) => {
    setSelectedFile(file)
  }, [setSelectedFile])

  // Memoized file processing
  const processedFiles = useMemo(() => 
    files.map((file, index) => {
      const parts = file.filename.split('/')
      const path = parts.slice(0, -1).join('/')
      const filename = parts.at(-1)
      
      const processed = {
        ...file,  // This preserves the original filename (full path)
        path,
        displayName: filename,  // Use displayName for the file part only
        isSelected: selectedFile?.filename === file.filename,
        key: `${file.filename}-${index}`,
        dataId: `file-item-${index}`
      }
      return processed
    }), 
    [files, selectedFile?.filename]
  )

  if (!shouldShow) return null

  return (
    <div className="w-full border-r-0 flex flex-col h-full relative z-10" data-id="files-panel">
      {/* Header */}
      <div className="p-4 border-b border-border flex justify-between items-center">
        <div>📁 Changed Files</div>
        <div>{files.length} file{files.length !== 1 ? 's' : ''}</div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {files.length === 0 ? (
          <EmptyState />
        ) : (
          <FilesList files={processedFiles} onSelectFile={selectFile} />
        )}
      </div>
    </div>
  )
}

// Extracted components for better performance
const EmptyState = () => (
  <div className="h-full overflow-y-auto p-4" data-id="files-list-empty">
    <div className="text-center py-8 text-slate-500 italic">
      Select a stash to view files
    </div>
  </div>
)

const FilesList = ({ files, onSelectFile }) => (
  <div
    data-id="files-list"
    className="h-full overflow-y-auto p-4 flex flex-col gap-2"
  >
    {files.map(file => (
      <FileItem key={file.key} file={file} onClick={onSelectFile} />
    ))}
  </div>
)

const FileItem = ({ file, onClick }) => (
  <button 
    className={classNames(
      'flex items-center gap-3 cursor-pointer hover:bg-hover',
      { 'text-on-surface font-bold': file.isSelected }
    )}
    onClick={() => onClick(file)}
    data-id={file.dataId}
  >
    <span className="shrink-0">{file.statusIcon}</span>
    <span className="grow overflow-hidden flex whitespace-nowrap">
      {file.path ? (
        <>
          <span className="truncate opacity-50">{file.path}</span>
          <span className="block">/{file.displayName}</span>
        </>
      ) : (
        <span className="truncate">{file.displayName}</span>
      )}
    </span>
  </button>
)

export default FilesPanel
