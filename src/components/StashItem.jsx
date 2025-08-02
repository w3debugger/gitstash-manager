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

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString()
    } catch {
      return dateString
    }
  }

  return (
    <div 
      className={classNames(
        'mx-4 mr-6 mb-1.5 bg-white/8 rounded-md border border-white/10',
        'transition-all duration-200 relative flex items-center overflow-hidden group',
        'hover:bg-white/15 hover:border-white/20 hover:translate-x-1',
        "before:content-[''] before:absolute before:-left-2.5 before:top-1/2",
        'before:w-2.5 before:h-px before:bg-white/30 before:transform before:-translate-y-1/2',
        {
          'bg-white/25 border-white/40 shadow-lg shadow-black/20': isSelected
        }
      )}
      onClick={selectStash}
      data-id={`stash-item-${repository.id}-${index}`}
    >
      <div className="flex-1 py-2.5 px-3 cursor-pointer min-w-0 overflow-hidden">
        <div className="font-medium text-sm leading-tight mb-1 text-white/90 break-words overflow-hidden" style={{
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical'
        }}>
          {stash.message}
        </div>
        <div className="text-xs opacity-60 text-white/70">
          📅 {formatDate(stash.date)} • {stash.author_name}
        </div>
      </div>
      <div className="flex gap-1 px-2 py-1.5 bg-black/15 border-l border-white/15 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <button 
          className="w-7 h-6 border border-white/20 rounded bg-white/10 cursor-pointer transition-all duration-200 text-xs flex items-center justify-center text-white hover:scale-105 hover:shadow-md hover:shadow-black/30 hover:bg-green-600/80 hover:border-green-500" 
          title="Apply Stash"
          onClick={applyStash}
          data-id={`apply-stash-btn-${repository.id}-${index}`}
        >
          ✅
        </button>
        <button 
          className="w-7 h-6 border border-white/20 rounded bg-white/10 cursor-pointer transition-all duration-200 text-xs flex items-center justify-center text-white hover:scale-105 hover:shadow-md hover:shadow-black/30 hover:bg-red-600/80 hover:border-red-500" 
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