import React from 'react'
import { useApp } from '../context/AppContext'
import FilesList from './FilesList'

function FilesSidebar() {
  const { 
    selectedRepository, 
    selectedStash, 
    files 
  } = useApp()

  const shouldShow = selectedRepository && selectedStash !== null

  if (!shouldShow) {
    return null
  }

  return (
    <div className="w-full bg-transparent border-r-0 flex flex-col h-full relative z-10" data-id="files-sidebar">
      <div className="p-4 border-b border-gray-500/20 flex justify-between items-center">
        <div>📁 Changed Files</div>
        <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full text-xs font-medium" data-id="files-count-badge">
          {files.length} file{files.length !== 1 ? 's' : ''}
        </span>
      </div>
      <div className="flex-1 overflow-hidden">
        <FilesList files={files} />
      </div>
    </div>
  )
}

export default FilesSidebar