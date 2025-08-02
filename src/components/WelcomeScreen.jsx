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
    <div className="welcome-screen">
      <div className="welcome-content">
        <div className="welcome-icon">🗳️</div>
        <h2>Welcome to Git Stash Election!</h2>
        <p>A desktop app for managing git stashes across multiple repositories</p>
        <div className="welcome-actions">
          <button 
            className="welcome-btn"
            onClick={addRepository}
          >
            ➕ Add Your First Repository
          </button>
        </div>
        <div className="welcome-features">
          <div className="feature">
            <span className="feature-icon">📂</span>
            <span>Manage multiple repositories</span>
          </div>
          <div className="feature">
            <span className="feature-icon">🏆</span>
            <span>Election-style stash browsing</span>
          </div>
          <div className="feature">
            <span className="feature-icon">⚡</span>
            <span>Quick apply and drop actions</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WelcomeScreen