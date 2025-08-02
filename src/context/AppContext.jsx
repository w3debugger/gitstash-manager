import React, { createContext, useContext, useReducer, useEffect } from 'react'

const AppContext = createContext()

// Action types
const ACTIONS = {
  SET_REPOSITORIES: 'SET_REPOSITORIES',
  SET_REPOSITORY_STASHES: 'SET_REPOSITORY_STASHES',
  SET_REPOSITORY_EXPANDED: 'SET_REPOSITORY_EXPANDED',
  SET_SELECTED_REPOSITORY: 'SET_SELECTED_REPOSITORY',
  SET_SELECTED_STASH: 'SET_SELECTED_STASH',
  SET_SELECTED_FILE: 'SET_SELECTED_FILE',
  SET_FILES: 'SET_FILES',
  SHOW_NOTIFICATION: 'SHOW_NOTIFICATION',
  CLEAR_NOTIFICATION: 'CLEAR_NOTIFICATION',
}

// Initial state
const initialState = {
  repositories: [],
  repositoryStashes: {}, // Store stashes per repository
  repositoryExpanded: {}, // Track expanded state per repository
  selectedRepository: null,
  selectedStash: null,
  selectedFile: null,
  files: [],
  notification: null,
}

// Reducer
function appReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_REPOSITORIES:
      return { ...state, repositories: action.payload }
    
    case ACTIONS.SET_REPOSITORY_STASHES:
      return {
        ...state,
        repositoryStashes: {
          ...state.repositoryStashes,
          [action.payload.repoId]: action.payload.stashes
        }
      }
    
    case ACTIONS.SET_REPOSITORY_EXPANDED:
      return {
        ...state,
        repositoryExpanded: {
          ...state.repositoryExpanded,
          [action.payload.repoId]: action.payload.expanded
        }
      }
    
    case ACTIONS.SET_SELECTED_REPOSITORY:
      return { ...state, selectedRepository: action.payload }
    
    case ACTIONS.SET_SELECTED_STASH:
      return { ...state, selectedStash: action.payload }
    
    case ACTIONS.SET_SELECTED_FILE:
      return { ...state, selectedFile: action.payload }
    
    case ACTIONS.SET_FILES:
      return { ...state, files: action.payload }
    
    case ACTIONS.SHOW_NOTIFICATION:
      return { ...state, notification: action.payload }
    
    case ACTIONS.CLEAR_NOTIFICATION:
      return { ...state, notification: null }
    
    default:
      return state
  }
}

// Provider component
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  // Notification auto-clear
  useEffect(() => {
    if (state.notification) {
      const timer = setTimeout(() => {
        dispatch({ type: ACTIONS.CLEAR_NOTIFICATION })
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [state.notification])

  // Helper functions
  const showNotification = (message, type = 'info') => {
    dispatch({
      type: ACTIONS.SHOW_NOTIFICATION,
      payload: { message, type }
    })
  }

  const clearNotification = () => {
    dispatch({ type: ACTIONS.CLEAR_NOTIFICATION })
  }

  const setRepositories = (repositories) => {
    dispatch({ type: ACTIONS.SET_REPOSITORIES, payload: repositories })
  }

  const setRepositoryStashes = (repoId, stashes) => {
    dispatch({
      type: ACTIONS.SET_REPOSITORY_STASHES,
      payload: { repoId, stashes }
    })
  }

  const setRepositoryExpanded = (repoId, expanded) => {
    dispatch({
      type: ACTIONS.SET_REPOSITORY_EXPANDED,
      payload: { repoId, expanded }
    })
  }

  const setSelectedRepository = (repository) => {
    dispatch({ type: ACTIONS.SET_SELECTED_REPOSITORY, payload: repository })
  }

  const setSelectedStash = (stashIndex) => {
    dispatch({ type: ACTIONS.SET_SELECTED_STASH, payload: stashIndex })
  }

  const setSelectedFile = (file) => {
    dispatch({ type: ACTIONS.SET_SELECTED_FILE, payload: file })
  }

  const setFiles = (files) => {
    dispatch({ type: ACTIONS.SET_FILES, payload: files })
  }

  const value = {
    ...state,
    showNotification,
    clearNotification,
    setRepositories,
    setRepositoryStashes,
    setRepositoryExpanded,
    setSelectedRepository,
    setSelectedStash,
    setSelectedFile,
    setFiles,
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

// Hook to use the context
export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}

export { ACTIONS }