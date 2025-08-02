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
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="bg-white py-5 px-5 border-b border-gray-200 flex justify-between items-center shadow-sm flex-shrink-0" data-id="files-sidebar-header">
          <h3 className="text-lg font-semibold text-slate-700 m-0">📁 Changed Files</h3>
          <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full text-xs font-medium" data-id="files-count-badge">
            {files.length} file{files.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex-1 overflow-hidden">
          <FilesList files={files} />
        </div>
      </div>
    </div>
  )
}

export default FilesSidebar