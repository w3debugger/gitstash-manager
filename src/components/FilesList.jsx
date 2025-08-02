import React from 'react'
import classNames from 'classnames'
import { useApp } from '../context/AppContext'

function FilesList({ files }) {
  const { 
    selectedFile, 
    setSelectedFile, 
    selectedRepository, 
    selectedStash,
    showNotification 
  } = useApp()

  const selectFile = async (file) => {
    setSelectedFile(file)
    
    // Load file content
    try {
      const result = await window.electronAPI.getStashFileContent(
        selectedRepository.path, 
        selectedStash, 
        file.filename
      )
      
      if (result.success) {
        // The file content will be displayed in the main content area
        // We could store it in context if needed, for now the component will load it
      } else {
        showNotification(`Failed to load file content: ${result.error}`, 'error')
      }
    } catch (error) {
      console.error('Error loading file content:', error)
      showNotification('Failed to load file content', 'error')
    }
  }

  if (files.length === 0) {
    return (
      <div className="h-full overflow-y-auto p-4" data-id="files-list-empty">
        <div className="text-center py-8 text-slate-500 italic">
          Select a stash to view files
        </div>
      </div>
    )
  }

  return (
    <div
      data-id="files-list"
      className="h-full overflow-y-auto p-4 flex flex-col gap-2"
    >
      {files.map((file, index) => {
        const splitFilename = file.filename.split('/');
        const path = splitFilename.slice(0, -1).join('/');
        const filename = splitFilename[splitFilename.length - 1];
        return (
          <div 
            key={`${file.filename}-${index}`}
            className={classNames(
              'flex items-center gap-3',
              'font-mono text-xs',
              'cursor-pointer',
              'hover:bg-gray-200',
              {
                'text-purple-500': selectedFile?.filename === file.filename
              }
            )}
            onClick={() => selectFile(file)}
            data-id={`file-item-${index}`}
          >
            <div className="shrink-0">{file.statusIcon}</div>
            <div className="grow overflow-hidden flex whitespace-nowrap">
              {path
                ? (
                <>
                  <div className="truncate">{path}</div>
                  <div>/{filename}</div>
                </>
                ) : (
                  <div className="truncate">{filename}</div>
                )}
            </div>
          </div>
        );
      })}
    </div>
  )
}

export default FilesList