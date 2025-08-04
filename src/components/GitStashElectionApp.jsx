import { use, useEffect, useCallback, useMemo } from 'react'
import { AppContext } from '../context/AppContext'
import RepositoriesPanel from './RepositoriesPanel'
import FilesPanel from './FilesPanel'
import StashDetailsView from './StashDetailsView'
import ThemeToggle from './ThemeToggle'
import Column from './ui/Column'
import Button from './ui/Button'
import Header from './ui/Header'

const GitStashElectionApp = () => {
  const { 
    repositories,
    setRepositories, 
    selectedRepository,
    selectedStash,
    files,
    setFiles,
    setSelectedFile,
    batchUpdate
  } = use(AppContext)

  // Memoized repository actions
  const repositoryActions = useMemo(() => ({
    async add() {
      try {
        await window.electronAPI.addRepositoryDialog()
      } catch (error) {
        console.error('Error adding repository:', error)
      }
    },

    async load() {
      try {
        const repositories = await window.electronAPI.getRepositories()
        setRepositories(repositories)
      } catch (error) {
        console.error('Error loading repositories:', error)
      }
    },

    async loadStashFiles() {
      if (!selectedRepository || selectedStash === null) return

      try {
        const { success, files, error } = await window.electronAPI.getStashFiles(
          selectedRepository.path, 
          selectedStash
        )
        
        // React 19: Batch multiple state updates
        batchUpdate([
          { type: 'SET_FILES', payload: success ? files : [] },
          { type: 'SET_SELECTED_FILE', payload: null }
        ])

        if (!success) {
          console.error('Failed to load files:', error)
        }
      } catch (error) {
        console.error('Error loading stash files:', error)
        setFiles([])
      }
    }
  }), [selectedRepository, selectedStash, setRepositories, setFiles, setSelectedFile, batchUpdate])

  // Optimized electron listeners setup
  const setupElectronListeners = useCallback(() => {
    const cleanup = []

    // Repository added listener
    const repositoryCleanup = window.electronAPI.onRepositoryAdded(() => repositoryActions.load())
    if (typeof repositoryCleanup === 'function') {
      cleanup.push(repositoryCleanup)
    }

    // Refresh requested listener  
    const refreshCleanup = window.electronAPI.onRefreshRequested(() => {
      if (selectedRepository && selectedStash !== null) {
        repositoryActions.loadStashFiles()
      }
    })
    if (typeof refreshCleanup === 'function') {
      cleanup.push(refreshCleanup)
    }

    return () => cleanup.forEach(fn => fn())
  }, [repositoryActions, selectedRepository, selectedStash])

  // Load files when selection changes
  useEffect(() => {
    repositoryActions.loadStashFiles()
  }, [selectedRepository, selectedStash, repositoryActions])

  // Initial setup
  useEffect(() => {
    repositoryActions.load()
    return setupElectronListeners()
  }, [repositoryActions, setupElectronListeners])

  const hasRepositories = repositories?.length > 0

  return (
    <div className="flex flex-col h-screen overflow-hidden" data-id="git-stash-app">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        {repositories.length > 0
          ? (
            <>
              <Column type="repositories">
                <RepositoriesPanel />
              </Column>

              {files.length > 0 ? (
                <>
                  <Column type="files">
                    <FilesPanel />
                  </Column>
                  <StashDetailsView 
                    hasRepositories={hasRepositories}
                    onAddRepository={repositoryActions.add}
                  />
                </>
              ) : (
                <NoFilesSelectedScreen />
              )}
            </>
          )
          : (
            <WelcomeScreen onAddRepository={repositoryActions.add} />
          )}
        
        <ThemeToggle />
      </div>
    </div>
  )
}

// Extracted welcome screen component
const WelcomeScreen = ({ onAddRepository }) => (
  <div className="w-full h-full flex-1 flex items-center justify-center" data-id="welcome">
    <div className="text-center">
      <div className="text-4xl mb-4">🗳️</div>
      <h2 className="text-2xl text-on-surface mb-6">Welcome to Git Stash Election</h2>
      <Button 
        variant="primary"
        onClick={onAddRepository}
        data-id="add-repository-btn"
      >
        ➕ Add Repository
      </Button>
    </div>
  </div>
)

const NoFilesSelectedScreen = () => (
  <div className="w-full h-full flex-1 flex items-center justify-center" data-id="no-files-selected">
    <div className="text-center">
      <div className="text-4xl mb-4">🗳️</div>
      <h2 className="text-2xl text-on-surface mb-6">No files selected, select a repo and stash</h2>
    </div>
  </div>
)

export default GitStashElectionApp
