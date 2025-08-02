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
    <div className="h-full overflow-y-auto p-4" data-id="files-list">
      {files.map((file, index) => {
        const splitFilename = file.filename.split('/');
        const path = splitFilename.slice(0, -1).join('/');
        const filename = splitFilename[splitFilename.length - 1];
        return (
          <div 
            key={`${file.filename}-${index}`}
            className={classNames(
              'bg-white border border-gray-200 py-3 px-4 mb-2',
              'cursor-pointer transition-all duration-300 relative flex items-center',
              'hover:shadow-md hover:border-blue-300 hover:-translate-y-0.5',
              {
                'shadow-md border-blue-400 bg-blue-50 -translate-y-0.5': selectedFile?.filename === file.filename
              }
            )}
            onClick={() => selectFile(file)}
            data-id={`file-item-${index}`}
          >
            <div className="text-lg mr-3 flex-shrink-0">{file.statusIcon}</div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm text-slate-800 mb-1 overflow-hidden flex whitespace-nowrap">
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
              <div 
                className={classNames(
                  'text-xs font-medium px-2 py-0.5 rounded inline-block',
                  {
                    'bg-green-100 text-green-700': file.status === 'Added',
                    'bg-yellow-100 text-yellow-700': file.status === 'Modified',
                    'bg-red-100 text-red-700': file.status === 'Deleted',
                    'bg-gray-100 text-gray-700': !['Added', 'Modified', 'Deleted'].includes(file.status)
                  }
                )}
              >
                {file.status}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  )
}

export default FilesList