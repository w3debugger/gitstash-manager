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
      <div className="files-list">
        <div className="loading-files">
          Select a stash to view files
        </div>
      </div>
    )
  }

  return (
    <div className="files-list">
      {files.map((file, index) => (
        <div 
          key={`${file.filename}-${index}`}
          className={`file-item ${selectedFile?.filename === file.filename ? 'selected' : ''}`}
          onClick={() => selectFile(file)}
        >
          <div className="file-icon">{file.statusIcon}</div>
          <div className="file-info">
            <div className="file-name">{file.filename}</div>
            <div className="file-status">{file.status}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default FilesList