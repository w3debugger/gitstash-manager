import React from 'react'
import classNames from 'classnames'
import { useApp } from '../context/AppContext'
import RepositoryItem from './RepositoryItem'

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
    <div className="w-full h-full flex flex-col" data-id="sidebar">
      <h2 className="text-lg font-semibold p-4">🗳️ Git Stash Election</h2>
      
      <div className="flex-1 flex flex-col grow gap-2 border-y border-white/10 p-4 overflow-y-auto">
        {repositories.map(repo => (
          <RepositoryItem key={repo.id} repository={repo} />
        ))}
      </div>

      <div className="flex justify-evenly gap-2 p-4">
        <button
          onClick={addRepository}
          data-id="add-repository-btn"
          className={classNames(
            'Button'
          )}
        >
          Add New Repository
        </button>
      </div>
    </div>
  )
}

export default Sidebar