import React from 'react'
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
      <div className="flex-1 overflow-y-auto p-4 min-h-[200px]">
        <div className="text-center py-8 text-slate-500 italic">
          Select a stash to view files
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 min-h-[200px]">
      {files.map((file, index) => (
        <div 
          key={`${file.filename}-${index}`}
          className={`bg-white border border-gray-200 rounded-lg py-3 px-4 mb-2 cursor-pointer transition-all duration-300 relative flex items-center hover:shadow-md hover:border-blue-300 hover:-translate-y-0.5 ${
            selectedFile?.filename === file.filename ? 'shadow-md border-blue-400 bg-blue-50 -translate-y-0.5' : ''
          }`}
          onClick={() => selectFile(file)}
        >
          <div className="text-lg mr-3 flex-shrink-0">{file.statusIcon}</div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm text-slate-800 truncate mb-1">{file.filename}</div>
            <div className={`text-xs font-medium px-2 py-0.5 rounded inline-block ${
              file.status === 'Added' ? 'bg-green-100 text-green-700' :
              file.status === 'Modified' ? 'bg-yellow-100 text-yellow-700' :
              file.status === 'Deleted' ? 'bg-red-100 text-red-700' :
              'bg-gray-100 text-gray-700'
            }`}>{file.status}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default FilesList