import React from 'react'
import { useApp } from '../context/AppContext'
import WelcomeScreen from './WelcomeScreen'
import RepositoryHeader from './RepositoryHeader'
import StashDetailsView from './StashDetailsView'

function MainContent() {
  const { repositories, selectedRepository } = useApp()

  if (repositories.length === 0) {
    return (
      <div className="main-content">
        <WelcomeScreen />
      </div>
    )
  }

  return (
    <div className="main-content">
      {selectedRepository && <RepositoryHeader />}
      <StashDetailsView />
    </div>
  )
}

export default MainContent