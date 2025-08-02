import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useApp } from '../context/AppContext'
import Sidebar from './Sidebar'
import FilesSidebar from './FilesSidebar'
import Notification from './Notification'
import WelcomeScreen from './WelcomeScreen'
import StashDetailsView from './StashDetailsView'

function GitStashElectionApp() {
  const { 
    repositories,
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
    <div className="flex h-screen overflow-hidden" data-id="git-stash-app">
      <div 
        ref={sidebarRef}
        className="relative bg-gradient-to-br from-purple-500 to-purple-700 text-white flex flex-col border-r border-white/10 overflow-visible min-w-[200px] max-w-[600px]"
        style={{ width: `${sidebarWidth}px` }}
        data-id="sidebar-container"
      >
        <Sidebar />
        <div 
          className="absolute top-0 bottom-0 -right-1 w-2.5 bg-transparent cursor-col-resize z-[10000] transition-colors duration-100 pointer-events-auto before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:transform before:-translate-x-1/2 before:-translate-y-1/2 before:w-0.5 before:h-5 before:bg-white/50 before:rounded-sm before:opacity-0 before:transition-opacity before:duration-100 hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-400/50 hover:before:opacity-100 hover:before:bg-white/90 active:bg-blue-600 active:shadow-xl active:shadow-blue-400/70"
          onMouseDown={(e) => handleResizeStart('sidebar', e)}
          title="Drag to resize sidebar"
          data-id="sidebar-resize-handle"
        />
      </div>
      
      <div 
        ref={filesSidebarRef}
        className="relative bg-gray-50 border-r border-gray-200 overflow-visible min-w-0 max-w-[500px]"
        style={{ width: selectedRepository && selectedStash !== null ? `${filesSidebarWidth}px` : '0px' }}
        data-id="files-sidebar-container"
      >
        <FilesSidebar />
        {selectedRepository && selectedStash !== null && (
          <div 
            className="absolute top-0 bottom-0 -right-1 w-2.5 bg-transparent cursor-col-resize z-[10000] transition-colors duration-100 pointer-events-auto before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:transform before:-translate-x-1/2 before:-translate-y-1/2 before:w-0.5 before:h-5 before:bg-white/50 before:rounded-sm before:opacity-0 before:transition-opacity before:duration-100 hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-400/50 hover:before:opacity-100 hover:before:bg-white/90 active:bg-blue-600 active:shadow-xl active:shadow-blue-400/70"
            onMouseDown={(e) => handleResizeStart('filesSidebar', e)}
            title="Drag to resize files panel"
            data-id="files-sidebar-resize-handle"
          />
        )}
      </div>
      
      <div className="flex-1 overflow-hidden bg-white" data-id="main-content-container">
        {repositories?.length > 0 ? (
          <StashDetailsView />
        ) : (
          <WelcomeScreen />
        )}
      </div>
      
      <Notification />
    </div>
  )
}

export default GitStashElectionApp