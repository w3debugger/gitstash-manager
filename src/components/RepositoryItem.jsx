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
      className={classNames(
        'mx-4 mb-2 bg-white/5 border border-white/10 overflow-hidden',
        'transition-all duration-300 hover:bg-white/10 hover:border-white/20',
        {
          'bg-white/15 border-white/25 shadow-lg shadow-black/20': isExpanded,
          'ring-2 ring-white/30': isSelected
        }
      )}
      data-id={`repository-item-${repository.id}`}
    >
      <div className="flex items-center py-3 px-4 cursor-pointer transition-all duration-200 hover:bg-white/10 relative group" onClick={toggleRepository} data-id={`repository-header-${repository.id}`}>
        <div className="flex-1 min-w-0 overflow-hidden">
          <div className="font-semibold text-sm mb-1 flex items-center gap-2 text-white/95">
            📂 {repository.name}
          </div>
          <div className="text-xs opacity-70 text-white/80 overflow-hidden text-ellipsis whitespace-nowrap break-all">{repository.path}</div>
        </div>
        <div className="flex gap-1 opacity-0 transition-opacity duration-300 group-hover:opacity-100 hover:opacity-100" onClick={(e) => e.stopPropagation()}>
          <button 
            className="bg-white/10 border-none text-white w-6 h-6 rounded cursor-pointer text-xs transition-all duration-200 flex items-center justify-center hover:bg-blue-500/80 hover:scale-110" 
            title="Refresh Repository"
            onClick={refreshRepository}
            data-id={`refresh-repository-btn-${repository.id}`}
          >
            🔄
          </button>
          <button 
            className="bg-white/10 border-none text-white w-6 h-6 rounded cursor-pointer text-xs transition-all duration-200 flex items-center justify-center hover:bg-red-500/80 hover:scale-110" 
            title="Remove Repository"
            onClick={removeRepository}
            data-id={`remove-repository-btn-${repository.id}`}
          >
            ✖️
          </button>
        </div>
      </div>
      
      {isExpanded && (
        <div className="py-2.5" data-id={`repository-stashes-${repository.id}`}>
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