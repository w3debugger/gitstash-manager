import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useApp } from '../context/AppContext'
import Sidebar from './Sidebar'
import FilesSidebar from './FilesSidebar'
import MainContent from './MainContent'
import Notification from './Notification'

function GitStashElectionApp() {
  const { 
    setRepositories, 
    showNotification, 
    selectedRepository,
    selectedStash,
    setFiles,
    setSelectedFile,
    sidebarWidth,
    setSidebarWidth,
    filesSidebarWidth,
    setFilesSidebarWidth
  } = useApp()

  // Resize state and refs
  const [isResizing, setIsResizing] = useState(null)
  const sidebarRef = useRef(null)
  const filesSidebarRef = useRef(null)
  const startX = useRef(0)
  const startWidth = useRef(0)
  const isResizingRef = useRef(null)

  // Update resize ref when state changes
  useEffect(() => {
    isResizingRef.current = isResizing
  }, [isResizing])

  // Handle resize move
  const handleResizeMove = useRef((e) => {
    const currentResizing = isResizingRef.current
    if (!currentResizing) return

    const deltaX = e.clientX - startX.current
    
    if (currentResizing === 'sidebar') {
      const newWidth = Math.max(200, Math.min(600, startWidth.current + deltaX))
      setSidebarWidth(newWidth)
    } else if (currentResizing === 'filesSidebar') {
      const newWidth = Math.max(200, Math.min(500, startWidth.current + deltaX))
      setFilesSidebarWidth(newWidth)
    }
  }).current

  // Handle resize end
  const handleResizeEnd = useRef(() => {
    setIsResizing(null)
    isResizingRef.current = null
    document.body.classList.remove('resizing')
    document.removeEventListener('mousemove', handleResizeMove)
    document.removeEventListener('mouseup', handleResizeEnd)
  }).current

  // Handle resize start
  const handleResizeStart = (panel, e) => {
    setIsResizing(panel)
    isResizingRef.current = panel
    startX.current = e.clientX
    
    if (panel === 'sidebar') {
      startWidth.current = sidebarWidth
    } else if (panel === 'filesSidebar') {
      startWidth.current = filesSidebarWidth
    }
    
    e.preventDefault()
    e.stopPropagation()
    document.body.classList.add('resizing')
    document.addEventListener('mousemove', handleResizeMove)
    document.addEventListener('mouseup', handleResizeEnd)
  }

  useEffect(() => {
    loadRepositories()
    setupElectronListeners()
  }, [])

  const loadRepositories = async () => {
    try {
      const repositories = await window.electronAPI.getRepositories()
      setRepositories(repositories)
    } catch (error) {
      console.error('Error loading repositories:', error)
      showNotification('Failed to load repositories', 'error')
    }
  }

  const setupElectronListeners = () => {
    // Listen for repository added from main process
    window.electronAPI.onRepositoryAdded((event, repo) => {
      loadRepositories()
      showNotification(`Repository "${repo.name}" added successfully!`, 'success')
    })

    // Listen for refresh requests from main process
    window.electronAPI.onRefreshRequested(() => {
      refreshCurrentRepository()
    })
  }

  const refreshCurrentRepository = async () => {
    if (selectedRepository && selectedStash !== null) {
      await loadStashFiles()
    }
  }

  const loadStashFiles = async () => {
    if (!selectedRepository || selectedStash === null) return

    try {
      const result = await window.electronAPI.getStashFiles(selectedRepository.path, selectedStash)
      
      if (result.success) {
        setFiles(result.files)
        setSelectedFile(null) // Clear selected file when loading new files
      } else {
        setFiles([])
        showNotification(`Failed to load files: ${result.error}`, 'error')
      }
    } catch (error) {
      console.error('Error loading stash files:', error)
      setFiles([])
      showNotification('Failed to load stash files', 'error')
    }
  }

  // Load files whenever repository or stash selection changes
  useEffect(() => {
    if (selectedRepository && selectedStash !== null) {
      loadStashFiles()
    }
  }, [selectedRepository, selectedStash])

  return (
    <div className="app-container">
      <div 
        ref={sidebarRef}
        className="sidebar-panel"
        style={{ width: `${sidebarWidth}px` }}
      >
        <Sidebar />
        <div 
          className="resize-handle resize-handle-right"
          onMouseDown={(e) => handleResizeStart('sidebar', e)}
          title="Drag to resize sidebar"
        />
      </div>
      
      <div 
        ref={filesSidebarRef}
        className="files-sidebar-panel"
        style={{ width: selectedRepository && selectedStash !== null ? `${filesSidebarWidth}px` : '0px' }}
      >
        <FilesSidebar />
        {selectedRepository && selectedStash !== null && (
          <div 
            className="resize-handle resize-handle-right"
            onMouseDown={(e) => handleResizeStart('filesSidebar', e)}
            title="Drag to resize files panel"
          />
        )}
      </div>
      
      <div className="main-content-panel">
        <MainContent />
      </div>
      
      <Notification />
    </div>
  )
}

export default GitStashElectionApp