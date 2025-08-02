import React from 'react'

function WelcomeScreen() {
  const addRepository = async () => {
    try {
      await window.electronAPI.addRepositoryDialog()
    } catch (error) {
      console.error('Error adding repository:', error)
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center p-10">
      <div className="text-center max-w-lg">
        <div className="text-6xl mb-5">🗳️</div>
        <h2 className="text-4xl text-slate-700 mb-4 font-semibold">Welcome to Git Stash Election!</h2>
        <p className="text-lg text-slate-500 mb-8 leading-relaxed">A desktop app for managing git stashes across multiple repositories</p>
        <div className="mb-10">
          <button 
            className="bg-gradient-to-br from-purple-500 to-purple-700 text-white border-none py-4 px-8 rounded-full text-lg font-semibold cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-500/30"
            onClick={addRepository}
          >
            ➕ Add Your First Repository
          </button>
        </div>
        <div className="flex flex-col gap-4 items-center">
          <div className="flex items-center gap-3 text-slate-500 text-base">
            <span className="text-xl">📂</span>
            <span>Manage multiple repositories</span>
          </div>
          <div className="flex items-center gap-3 text-slate-500 text-base">
            <span className="text-xl">🏆</span>
            <span>Election-style stash browsing</span>
          </div>
          <div className="flex items-center gap-3 text-slate-500 text-base">
            <span className="text-xl">⚡</span>
            <span>Quick apply and drop actions</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WelcomeScreen