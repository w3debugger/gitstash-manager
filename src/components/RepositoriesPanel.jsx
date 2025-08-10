import { use, useCallback, useMemo, useEffect } from 'react'
import classNames from 'classnames'
import { AppContext } from '../context/AppContext'
import StashList from './StashList'
import RepositoryStatus from './RepositoryStatus'
import Button from './ui/Button'

const RepositoriesPanel = () => {
  const { 
    repositories,
    repositoryStashes, 
    repositoryExpanded, 
    selectedRepository,
    repositoriesPanelMinimized,
    columns,
    setRepositoryStashes,
    setRepositoryExpanded,
    setRepositoriesPanelMinimized,
    setColumnWidth,
  } = use(AppContext)

  // Memoized repository operations
  const repositoryOps = useMemo(() => ({
    async add() {
      try {
        await window.electronAPI.addRepositoryDialog()
      } catch (error) {
        console.error('Error adding repository:', error)
      }
    },

    async loadStashes(repository) {
      try {
        setRepositoryStashes(repository.id, 'loading')
        const { success, stashes, error } = await window.electronAPI.getStashes(repository.path)
        
        setRepositoryStashes(repository.id, success ? stashes : [])
        
        if (!success) {
          console.error(`Failed to load stashes for ${repository.name}:`, error)
        }
      } catch (error) {
        console.error('Error loading repository stashes:', error)
        setRepositoryStashes(repository.id, [])
      }
    },

    async toggle(repository) {
      const isExpanded = repositoryExpanded[repository.id]
      const newExpanded = !isExpanded
      
      setRepositoryExpanded(repository.id, newExpanded)
      
      // Load stashes if expanding and not already loaded
      if (newExpanded && !repositoryStashes[repository.id]) {
        await this.loadStashes(repository)
      }
    },

    async refresh(repository) {
      console.log(`Refreshing ${repository.name}...`)
      
      // React 19: Batch the reset and potential reload
      setRepositoryStashes(repository.id, undefined)
      
      if (repositoryExpanded[repository.id]) {
        await this.loadStashes(repository)
      }
      
      console.log(`${repository.name} refreshed!`)
    },

    async remove(repository) {
      const confirmed = window.confirm(
        `Remove ${repository.name} from the list? This won't delete the repository from your computer.`
      )
      if (!confirmed) return

      try {
        await window.electronAPI.removeRepository(repository.id)
        console.log(`${repository.name} removed from list`)
      } catch (error) {
        console.error('Error removing repository:', error)
      }
    }
  }), [repositoryExpanded, repositoryStashes, setRepositoryStashes, setRepositoryExpanded])

  // Memoized repository list with processed data
  const processedRepositories = useMemo(() => 
    repositories.map(repository => ({
      ...repository,
      isExpanded: repositoryExpanded[repository.id],
      stashes: repositoryStashes[repository.id] || [],
      isSelected: selectedRepository?.id === repository.id
    })), 
    [repositories, repositoryExpanded, repositoryStashes, selectedRepository?.id]
  )

  // Auto-adjust column width when minimized state changes
  useEffect(() => {
    if (repositoriesPanelMinimized) {
      // Set to a compact width for minimized view
      setColumnWidth('repositories', 49)
    } else {
      // Restore to default width
      setColumnWidth('repositories', 300)
    }
  }, [repositoriesPanelMinimized, setColumnWidth])

  return (
    <div className="w-full h-full flex flex-col" data-id="repositories-panel">
      <div
        className={classNames(
          'flex items-center p-2 border-b border-border',
          repositoriesPanelMinimized ? 'justify-center' : 'justify-between'
        )}
      >
        {!repositoriesPanelMinimized && (
          <span className="opacity-60">
            {repositoriesPanelMinimized ? '' : 'Repositories'}
          </span>
        )}
        <Button
          onClick={() => setRepositoriesPanelMinimized(!repositoriesPanelMinimized)}
          title={repositoriesPanelMinimized ? "Expand panel" : "Minimize panel"}
          variant="secondary"
        >
          {repositoriesPanelMinimized ? '>' : '<'}
        </Button>
      </div>

      {/* Repository List - always visible but layout changes */}
      <RepositoryList
        repositories={processedRepositories}
        operations={repositoryOps}
        isMinimized={repositoriesPanelMinimized}
      />
      <div className="flex justify-center gap-2 py-4">
        <Button
          onClick={repositoryOps.add}
          data-id="add-repository-btn"
          variant="secondary"
        >
          {repositoriesPanelMinimized ? '+' : 'Add New Repository'}
        </Button>
      </div>
    </div>
  )
}

const RepositoryList = ({ repositories, operations, isMinimized }) => (
  <div className="flex-1 flex flex-col grow border-b border-border overflow-y-auto">
    {repositories.map(repository => (
      <RepositoryItem 
        key={repository.id} 
        repository={repository} 
        operations={operations}
        isMinimized={isMinimized}
      />
    ))}
  </div>
)

const RepositoryItem = ({ repository, operations, isMinimized }) => (
  <div className="border-b border-border" data-id={`repository-item-${repository.id}`}>
    <RepositoryHeader repository={repository} operations={operations} isMinimized={isMinimized} />
    {repository.isExpanded && (
      <>
        <RepositoryStatus repository={repository} isMinimized={isMinimized} />
        <StashList repository={repository} stashes={repository.stashes} />
      </>
    )}
  </div>
)

const RepositoryHeader = ({ repository, operations, isMinimized }) => {
  const handleClick = useCallback(() => operations.toggle(repository), [repository, operations]) 

  const handleRemove = useCallback((e) => {
    e.stopPropagation()
    operations.remove(repository)
  }, [repository, operations])

  return (
    <div
      className={classNames(
        'flex justify-between items-center gap-2 p-2 group/repository-header overflow-hidden',
      )}
      data-id={`repository-header-${repository.id}`}
    >
      <button
        className={`flex items-center gap-2 overflow-hidden cursor-pointer group/repo ${
          isMinimized ? 'justify-center' : ''
        }`}
        title={repository.path}
        onClick={handleClick}
        type="button"
      >
        <RepositoryIcon repository={repository} isMinimized={isMinimized} />
        {!isMinimized && <span className="truncate">{repository.name}</span>}
        
        {isMinimized && (
          <div
            className={classNames(
              'group-hover/repo:opacity-100',
              'bg-primary text-on-primary text-xs',
              'whitespace-nowrap',
              'px-2 py-1',
              'ml-2',
              'rounded shadow-lg',
              'absolute left-full z-30',
              'opacity-0  transition-opacity',
              'pointer-events-none',
            )}
          >
            {repository.name}
          </div>
        )}
      </button>

      {!isMinimized && (
        <button 
          title="Remove Repository"
          onClick={handleRemove}
          data-id={`remove-repository-btn-${repository.id}`}
          type="button"
          className="font-bold text-red-500 cursor-pointer translate-x-10 group-hover/repository-header:translate-x-0 transition-transform duration-300"
        >
          DEL
        </button>
      )}
    </div>
  )
}

const RepositoryIcon = ({ repository, isMinimized }) => {
  const [firstCharacter, secondCharacter] = repository.name.split('-') || ['', '']

  return (
    <div className="relative">
      <span className="flex items-center justify-center gap-1 bg-primary-text rounded-md p-1 size-8 shrink-0 border border-border">
        {firstCharacter?.toUpperCase().slice(0, 1)}{secondCharacter?.toUpperCase().slice(0, 1)}
      </span>
      
      {/* Stash count badge for minimized view */}
      {isMinimized && repository.stashes && repository.stashes.length > 0 && (
        <div className="absolute -top-1 -right-1 bg-primary text-on-primary text-xs rounded-full size-5 flex items-center justify-center font-medium">
          {repository.stashes.length}
        </div>
      )}
    </div>
  )
}

export default RepositoriesPanel
