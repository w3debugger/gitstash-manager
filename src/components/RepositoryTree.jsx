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
      <div className="repositories-tree">
        <div className="empty-repositories">
          <div className="empty-icon">📁</div>
          <p>No repositories added</p>
          <button 
            className="add-first-repo"
            onClick={addRepository}
          >
            Add Repository
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="repositories-tree">
      {repositories.map(repo => (
        <RepositoryItem key={repo.id} repository={repo} />
      ))}
    </div>
  )
}

export default RepositoryTree