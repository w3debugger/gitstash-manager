import React from 'react'
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

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString()
    } catch {
      return dateString
    }
  }

  return (
    <div 
      className={`tree-stash-item ${isSelected ? 'selected' : ''}`}
      onClick={selectStash}
    >
      <div className="stash-content">
        <div className="stash-info">
          <div className="stash-message">{stash.message}</div>
          <div className="stash-meta">
            📅 {formatDate(stash.date)} • {stash.author_name}
          </div>
        </div>
        <div className="stash-actions">
          <button 
            className="stash-action-btn apply" 
            title="Apply Stash"
            onClick={applyStash}
          >
            ✅
          </button>
          <button 
            className="stash-action-btn drop" 
            title="Drop Stash"
            onClick={dropStash}
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  )
}

export default StashItem