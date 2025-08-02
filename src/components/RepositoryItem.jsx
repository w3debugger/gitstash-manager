import React from 'react'
import classNames from 'classnames'
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
    <div 
      data-id={`repository-item-${repository.id}`}
      className={classNames(
        'border border-white/20 rounded-xl',
        {
          'bg-white/10': isExpanded,
          'bg-white/5': isSelected
        }
      )}
    >
      <div
        data-id={`repository-header-${repository.id}`}
        onClick={toggleRepository}
        className="flex items-center gap-2 p-2 cursor-pointer"
      >
        <div className="flex flex-col gap-1 grow overflow-hidden">
          <div>{repository.name}</div>
          <div className="text-xs truncate text-white/60">{repository.path}</div>
        </div>
        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
          <button 
            className="IconButton" 
            title="Refresh Repository"
            onClick={refreshRepository}
            data-id={`refresh-repository-btn-${repository.id}`}
          >
            🔄
          </button>
          <button 
            className="IconButton" 
            title="Remove Repository"
            onClick={removeRepository}
            data-id={`remove-repository-btn-${repository.id}`}
          >
            ✖️
          </button>
        </div>
      </div>
      
      {isExpanded && (
        <div
          data-id={`repository-stashes-${repository.id}`}
          className="border-t border-gray-500/50"
        >
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