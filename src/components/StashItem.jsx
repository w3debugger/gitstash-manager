import React from 'react'
import classNames from 'classnames'
import { useApp } from '../context/AppContext'

function StashItem({ repository, stash, index }) {
  const { 
    selectedRepository,
    selectedStash,
    setSelectedRepository,
    setSelectedStash,
    setSelectedFile,
    showNotification,
    setRepositoryStashes
  } = useApp()

  const isSelected = selectedRepository?.id === repository.id && selectedStash === index

  const selectStash = () => {
    setSelectedRepository(repository)
    setSelectedStash(index)
    setSelectedFile(null)
  }

  const applyStash = async (e) => {
    e.stopPropagation()
    
    const confirmed = window.confirm(`Are you sure you want to apply stash@{${index}} from ${repository.name}?`)
    if (!confirmed) return

    try {
      const result = await window.electronAPI.applyStash(repository.path, index)
      
      if (result.success) {
        showNotification(result.message, 'success')
      } else {
        showNotification(result.error || 'Failed to apply stash', 'error')
      }
    } catch (error) {
      console.error('Error applying stash:', error)
      showNotification('Failed to apply stash', 'error')
    }
  }

  const dropStash = async (e) => {
    e.stopPropagation()
    
    const confirmed = window.confirm(`Are you sure you want to permanently delete stash@{${index}} from ${repository.name}? This action cannot be undone!`)
    if (!confirmed) return

    try {
      const result = await window.electronAPI.dropStash(repository.path, index)
      
      if (result.success) {
        showNotification(result.message, 'success')
        
        // Clear selection if we dropped the selected stash
        if (selectedRepository?.id === repository.id && selectedStash === index) {
          setSelectedStash(null)
          setSelectedFile(null)
        }
        
        // Reload stashes for this repository
        const stashResult = await window.electronAPI.getStashes(repository.path)
        if (stashResult.success) {
          setRepositoryStashes(repository.id, stashResult.stashes)
        }
      } else {
        showNotification(result.error || 'Failed to drop stash', 'error')
      }
    } catch (error) {
      console.error('Error dropping stash:', error)
      showNotification('Failed to drop stash', 'error')
    }
  }

  return (
    <div 
      className={classNames(
        'flex gap-2',
        {
          'bg-gray-100/10': isSelected
        }
      )}
      onClick={selectStash}
      data-id={`stash-item-${repository.id}-${index}`}
    >
      <button className="TextButton truncate font-mono">
        {index}: {stash.message}
      </button>

      <div className="flex gap-1">
        <button 
          className="IconButton" 
          title="Apply Stash"
          onClick={applyStash}
          data-id={`apply-stash-btn-${repository.id}-${index}`}
        >
          ✅
        </button>
        <button 
          className="IconButton" 
          title="Drop Stash"
          onClick={dropStash}
          data-id={`drop-stash-btn-${repository.id}-${index}`}
        >
          🗑️
        </button>
      </div>
    </div>
  )
}

export default StashItem