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
    <div className="stash-details-view" style={{ display: shouldShow ? 'flex' : 'none' }}>
      <div className="details-content">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <pre>{content}</pre>
        )}
      </div>
    </div>
  )
}

export default StashDetailsView