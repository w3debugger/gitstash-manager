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
    <div className="bg-white py-6 px-8 border-b border-gray-200 flex justify-between items-center shadow-sm">
      <div>
        <h1 className="text-3xl text-slate-700 mb-1 font-semibold">{selectedRepository.name}</h1>
        <p className="text-slate-500 text-base">{selectedRepository.path}</p>
      </div>
      <div>
        <button 
          className="bg-blue-500 text-white border-none py-3 px-6 rounded-full cursor-pointer font-semibold transition-all duration-300 hover:bg-blue-600 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          onClick={refreshAllRepositories}
        >
          🔄 Refresh All
        </button>
      </div>
    </div>
  )
}

export default RepositoryHeader