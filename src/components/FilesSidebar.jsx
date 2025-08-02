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
    <div className="files-sidebar" id="files-sidebar">
      <div className="files-section">
        <div className="files-header">
          <h3>📁 Changed Files</h3>
          <span className="files-count">
            {files.length} file{files.length !== 1 ? 's' : ''}
          </span>
        </div>
        <FilesList files={files} />
      </div>
    </div>
  )
}

export default FilesSidebar