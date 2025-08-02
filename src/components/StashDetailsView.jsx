import React, { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'

function StashDetailsView() {
  const { 
    selectedRepository, 
    selectedStash, 
    selectedFile,
    showNotification 
  } = useApp()
  
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadContent()
  }, [selectedRepository, selectedStash, selectedFile])

  const loadContent = async () => {
    if (!selectedRepository || selectedStash === null) {
      setContent('👈 Select a stash from the sidebar to view its changes')
      return
    }

    if (selectedFile) {
      // Load specific file content
      setLoading(true)
      try {
        const result = await window.electronAPI.getStashFileContent(
          selectedRepository.path, 
          selectedStash, 
          selectedFile.filename
        )
        
        if (result.success) {
          setContent(result.content)
        } else {
          setContent(`Error loading file content: ${result.error}`)
          showNotification(`Failed to load file content: ${result.error}`, 'error')
        }
      } catch (error) {
        console.error('Error loading file content:', error)
        setContent('Error loading file content')
        showNotification('Failed to load file content', 'error')
      }
      setLoading(false)
    } else {
      // Load general stash content
      setLoading(true)
      try {
        const result = await window.electronAPI.getStashContent(
          selectedRepository.path, 
          selectedStash
        )
        
        if (result.success) {
          setContent(result.content)
        } else {
          setContent(`Error loading stash content: ${result.error}`)
          showNotification(`Failed to load stash content: ${result.error}`, 'error')
        }
      } catch (error) {
        console.error('Error loading stash content:', error)
        setContent('Error loading stash content')
        showNotification('Failed to load stash content', 'error')
      }
      setLoading(false)
    }
  }

  const shouldShow = selectedRepository && selectedStash !== null

  return (
    <div className="flex-1 m-0 bg-white flex flex-col overflow-hidden p-5" style={{ display: shouldShow ? 'flex' : 'none' }} data-id="stash-details-view">
      <div className="flex-1 overflow-auto bg-gray-50 rounded-lg p-5 font-mono text-sm leading-relaxed border" data-id="stash-content-display">
        {loading ? (
          <div className="flex items-center justify-center h-full text-slate-500" data-id="stash-content-loading">Loading...</div>
        ) : (
          <pre className="whitespace-pre-wrap break-words text-slate-800" data-id="stash-content-text">{content}</pre>
        )}
      </div>
    </div>
  )
}

export default StashDetailsView