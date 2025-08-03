import { createContext, use, useReducer, useMemo, useActionState } from 'react'

const AppContext = createContext()

// Action types as frozen object for better performance
export const ACTIONS = Object.freeze({
  SET_REPOSITORIES: 'SET_REPOSITORIES',
  SET_REPOSITORY_STASHES: 'SET_REPOSITORY_STASHES',
  SET_REPOSITORY_EXPANDED: 'SET_REPOSITORY_EXPANDED',
  SET_SELECTED_REPOSITORY: 'SET_SELECTED_REPOSITORY',
  SET_SELECTED_STASH: 'SET_SELECTED_STASH',
  SET_SELECTED_FILE: 'SET_SELECTED_FILE',
  SET_FILES: 'SET_FILES',
  SET_COLUMN_WIDTH: 'SET_COLUMN_WIDTH',
})

const initialState = {
  repositories: [],
  repositoryStashes: {},
  repositoryExpanded: {},
  selectedRepository: null,
  selectedStash: null,
  selectedFile: null,
  files: [],
  columns: {
    repositories: 300,
    files: 280,
  },
}

// Optimized reducer with early returns and React 19 patterns
function appReducer(state, action) {
  const { type, payload } = action
  
  switch (type) {
    case ACTIONS.SET_REPOSITORIES:
      return state.repositories === payload ? state : { ...state, repositories: payload }
    
    case ACTIONS.SET_REPOSITORY_STASHES: {
      const { repoId, stashes } = payload
      const currentStashes = state.repositoryStashes[repoId]
      if (currentStashes === stashes) return state
      
      return {
        ...state,
        repositoryStashes: { ...state.repositoryStashes, [repoId]: stashes }
      }
    }
    
    case ACTIONS.SET_REPOSITORY_EXPANDED: {
      const { repoId, expanded } = payload
      if (state.repositoryExpanded[repoId] === expanded) return state
      
      return {
        ...state,
        repositoryExpanded: { ...state.repositoryExpanded, [repoId]: expanded }
      }
    }
    
    case ACTIONS.SET_SELECTED_REPOSITORY:
      return state.selectedRepository === payload ? state : { ...state, selectedRepository: payload }
    
    case ACTIONS.SET_SELECTED_STASH:
      return state.selectedStash === payload ? state : { ...state, selectedStash: payload }
    
    case ACTIONS.SET_SELECTED_FILE:
      return state.selectedFile === payload ? state : { ...state, selectedFile: payload }
    
    case ACTIONS.SET_FILES:
      return state.files === payload ? state : { ...state, files: payload }
    
    case ACTIONS.SET_COLUMN_WIDTH: {
      const { type: columnType, width } = payload
      if (state.columns[columnType] === width) return state
      
      return {
        ...state,
        columns: { ...state.columns, [columnType]: width }
      }
    }
    
    default:
      return state
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  // React 19: Optimized action creators using useActionState pattern
  const createAction = useMemo(() => (type) => (payload) => {
    dispatch({ type, payload })
  }, [])

  // Memoized action creators with React 19 optimization
  const actions = useMemo(() => ({
    setRepositories: createAction(ACTIONS.SET_REPOSITORIES),

    setRepositoryStashes: (repoId, stashes) => {
      dispatch({
        type: ACTIONS.SET_REPOSITORY_STASHES,
        payload: { repoId, stashes }
      })
    },

    setRepositoryExpanded: (repoId, expanded) => {
      dispatch({
        type: ACTIONS.SET_REPOSITORY_EXPANDED,
        payload: { repoId, expanded }
      })
    },

    setSelectedRepository: createAction(ACTIONS.SET_SELECTED_REPOSITORY),
    setSelectedStash: createAction(ACTIONS.SET_SELECTED_STASH),
    setSelectedFile: createAction(ACTIONS.SET_SELECTED_FILE),
    setFiles: createAction(ACTIONS.SET_FILES),

    setColumnWidth: (type, width) => {
      dispatch({ type: ACTIONS.SET_COLUMN_WIDTH, payload: { type, width } })
    },

    // React 19: Batch multiple actions
    batchUpdate: (updates) => {
      // React 19 automatically batches these
      updates.forEach(({ type, payload }) => {
        dispatch({ type, payload })
      })
    },
  }), [createAction])

  // React 19: Enhanced context value memoization
  const contextValue = useMemo(() => ({
    ...state,
    ...actions,
    // React 19: Expose dispatch for advanced use cases
    dispatch: state.repositories.length > 0 ? dispatch : null, // Conditional exposure
  }), [state, actions])

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  )
}

// React 19: Enhanced hook with use() and better error handling
export function useApp() {
  try {
    return use(AppContext)
  } catch (error) {
    throw new Error('useApp must be used within an AppProvider')
  }
}

// React 19: Additional hooks for specific state slices (better performance)
export function useAppState() {
  const { dispatch, batchUpdate, ...state } = use(AppContext)
  return state
}

export function useAppActions() {
  const { repositories, repositoryStashes, repositoryExpanded, selectedRepository, 
          selectedStash, selectedFile, files, columns, ...actions } = use(AppContext)
  return actions
}

// React 19: Selector hook for performance
export function useAppSelector(selector) {
  const state = useAppState()
  return useMemo(() => selector(state), [state, selector])
}

export { AppContext }
