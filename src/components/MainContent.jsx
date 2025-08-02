import React from 'react'
import { useApp } from '../context/AppContext'
import WelcomeScreen from './WelcomeScreen'
import RepositoryHeader from './RepositoryHeader'
import StashDetailsView from './StashDetailsView'

function MainContent() {
  const { repositories, selectedRepository } = useApp()

  if (repositories.length === 0) {
    return (
      <div className="w-full h-full flex flex-col overflow-hidden">
        <WelcomeScreen />
      </div>
    )
  }

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      {selectedRepository && <RepositoryHeader />}
      <StashDetailsView />
    </div>
  )
}

export default MainContent