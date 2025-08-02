import React from 'react'
import { AppProvider } from './context/AppContext'
import GitStashElectionApp from './components/GitStashElectionApp'

function App() {
  return (
    <AppProvider>
      <GitStashElectionApp />
    </AppProvider>
  )
}

export default App