import React from 'react'
import { useApp } from '../context/AppContext'
import RepositoryItem from './RepositoryItem'

function RepositoryTree({ repositories }) {
  const addRepository = async () => {
    try {
      await window.electronAPI.addRepositoryDialog()
    } catch (error) {
      console.error('Error adding repository:', error)
    }
  }

  if (repositories.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto py-2.5" data-id="repository-tree-empty">
        <div className="flex flex-col items-center justify-center p-8 opacity-80">
          <div className="text-4xl mb-4">📁</div>
          <p className="text-sm opacity-90 mb-4 text-center">No repositories added</p>
          <button 
            className="bg-white/20 border border-white/30 text-white px-4 py-2 rounded-md cursor-pointer text-sm transition-all duration-300 hover:bg-white/30 hover:border-white/40 hover:scale-105"
            onClick={addRepository}
            data-id="add-first-repository-btn"
          >
            Add Repository
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto py-2.5" data-id="repository-tree">
      {repositories.map(repo => (
        <RepositoryItem key={repo.id} repository={repo} />
      ))}
    </div>
  )
}

export default RepositoryTree