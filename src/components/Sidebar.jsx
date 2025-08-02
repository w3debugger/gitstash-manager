import React from 'react'
import { useApp } from '../context/AppContext'
import RepositoryTree from './RepositoryTree'

function Sidebar() {
  const { repositories } = useApp()

  const addRepository = async () => {
    try {
      await window.electronAPI.addRepositoryDialog()
    } catch (error) {
      console.error('Error adding repository:', error)
    }
  }

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>🗳️ Git Stash Election</h2>
        <button 
          className="add-repo-btn" 
          title="Add Repository"
          onClick={addRepository}
        >
          ➕
        </button>
      </div>
      
      <div className="repositories-section">
        <div className="repositories-header">
          <h3>📁 Repositories</h3>
          <button 
            className="add-repo-btn-header" 
            title="Add Repository"
            onClick={addRepository}
          >
            ➕
          </button>
        </div>
        <RepositoryTree repositories={repositories} />
      </div>
    </div>
  )
}

export default Sidebar