import React from 'react'
import { useApp } from '../context/AppContext'
import StashList from './StashList'

function RepositoryItem({ repository }) {
  const { 
    repositoryStashes, 
    repositoryExpanded, 
    selectedRepository,
    setRepositoryStashes,
    setRepositoryExpanded,
    showNotification 
  } = useApp()

  const isExpanded = repositoryExpanded[repository.id]
  const stashes = repositoryStashes[repository.id] || []
  const isSelected = selectedRepository?.id === repository.id

  const toggleRepository = async () => {
    const newExpanded = !isExpanded
    setRepositoryExpanded(repository.id, newExpanded)
    
    // If expanding and we don't have stashes loaded, load them
    if (newExpanded && !repositoryStashes[repository.id]) {
      await loadRepositoryStashes()
    }
  }

  const loadRepositoryStashes = async () => {
    try {
      // Show loading state
      setRepositoryStashes(repository.id, 'loading')

      const result = await window.electronAPI.getStashes(repository.path)
      
      if (result.success) {
        setRepositoryStashes(repository.id, result.stashes)
      } else {
        setRepositoryStashes(repository.id, [])
        showNotification(`Failed to load stashes for ${repository.name}: ${result.error}`, 'error')
      }
    } catch (error) {
      console.error('Error loading repository stashes:', error)
      setRepositoryStashes(repository.id, [])
      showNotification(`Failed to load stashes for ${repository.name}`, 'error')
    }
  }

  const refreshRepository = async () => {
    showNotification(`Refreshing ${repository.name}...`, 'info')
    
    // Clear and reload stashes for this repository
    setRepositoryStashes(repository.id, undefined)
    
    if (isExpanded) {
      await loadRepositoryStashes()
    }
    
    showNotification(`${repository.name} refreshed!`, 'success')
  }

  const removeRepository = async () => {
    const confirmed = window.confirm(`Remove ${repository.name} from the list? This won't delete the repository from your computer.`)
    if (!confirmed) return

    try {
      await window.electronAPI.removeRepository(repository.id)
      // Repository list will be updated via the electron listener
      showNotification(`${repository.name} removed from list`, 'success')
    } catch (error) {
      console.error('Error removing repository:', error)
      showNotification('Failed to remove repository', 'error')
    }
  }

  return (
    <div className={`repository-tree-item ${isExpanded ? 'expanded' : ''} ${isSelected ? 'selected' : ''}`}>
      <div className="repository-header" onClick={toggleRepository}>
        <div className="repo-info">
          <div className="repo-name">
            📂 {repository.name}
          </div>
          <div className="repo-path">{repository.path}</div>
        </div>
        <div className="repo-actions" onClick={(e) => e.stopPropagation()}>
          <button 
            className="repo-action-btn refresh" 
            title="Refresh Repository"
            onClick={refreshRepository}
          >
            🔄
          </button>
          <button 
            className="repo-action-btn remove" 
            title="Remove Repository"
            onClick={removeRepository}
          >
            ✖️
          </button>
        </div>
      </div>
      
      {isExpanded && (
        <div className="stashes-container">
          <StashList 
            repository={repository}
            stashes={stashes}
          />
        </div>
      )}
    </div>
  )
}

export default RepositoryItem