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
    <div className="w-full bg-transparent text-white flex flex-col border-r-0 overflow-hidden relative z-10" data-id="sidebar">
      <div className="p-5 border-b border-white/10 flex justify-between items-center" data-id="sidebar-header">
        <h2 className="text-lg font-semibold">🗳️ Git Stash Election</h2>
      </div>
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="py-5 px-5 pb-2.5 flex justify-between items-center border-b border-white/10">
          <h3 className="text-base m-0 opacity-90 font-medium">📁 Repositories</h3>
          <button 
            className="bg-white/20 border-none text-white w-6 h-6 rounded-full cursor-pointer text-xs transition-all duration-300 hover:bg-white/30 hover:scale-110" 
            title="Add Repository"
            onClick={addRepository}
            data-id="add-repository-btn"
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