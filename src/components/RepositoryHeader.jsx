import React from 'react'
import { useApp } from '../context/AppContext'

function RepositoryHeader() {
  const { 
    selectedRepository, 
    setRepositoryStashes,
    repositoryExpanded,
    showNotification 
  } = useApp()

  const refreshAllRepositories = async () => {
    showNotification('Refreshing all repositories...', 'info')
    
    // Clear all repository stashes that are expanded
    for (const [repoId, isExpanded] of Object.entries(repositoryExpanded)) {
      if (isExpanded) {
        setRepositoryStashes(repoId, undefined)
        
        // Reload the repository
        try {
          const repo = { id: repoId, path: selectedRepository.path } // This would need proper repo lookup
          const result = await window.electronAPI.getStashes(repo.path)
          if (result.success) {
            setRepositoryStashes(repoId, result.stashes)
          }
        } catch (error) {
          console.error('Error refreshing repository:', error)
        }
      }
    }
    
    showNotification('All repositories refreshed!', 'success')
  }

  if (!selectedRepository) return null

  return (
    <div className="repo-header">
      <div className="repo-info">
        <h1>{selectedRepository.name}</h1>
        <p>{selectedRepository.path}</p>
      </div>
      <div className="repo-actions">
        <button 
          className="refresh-btn"
          onClick={refreshAllRepositories}
        >
          🔄 Refresh All
        </button>
      </div>
    </div>
  )
}

export default RepositoryHeader