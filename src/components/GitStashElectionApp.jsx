import React, { useEffect } from 'react'
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
    setSelectedFile
  } = useApp()

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
      <Sidebar />
      <FilesSidebar />
      <MainContent />
      <Notification />
    </div>
  )
}

export default GitStashElectionApp