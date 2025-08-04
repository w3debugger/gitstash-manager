import { use, useCallback, useMemo } from 'react'
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
    setRepositoryStashes,
    setRepositoryExpanded,
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

  return (
    <div className="w-full h-full flex flex-col" data-id="repositories-panel">
      <RepositoryList
        repositories={processedRepositories}
        operations={repositoryOps}
      />
      <div className="flex justify-evenly gap-2 p-4">
        <Button
          onClick={repositoryOps.add}
          data-id="add-repository-btn"
          variant="secondary"
          className="bg-on-primary text-on-primary border-border hover:bg-on-primary/30"
        >
          Add New Repository
        </Button>
      </div>
    </div>
  )
}

const RepositoryList = ({ repositories, operations }) => (
  <div className="flex-1 flex flex-col grow border-b border-border overflow-y-auto">
    {repositories.map(repository => (
      <RepositoryItem 
        key={repository.id} 
        repository={repository} 
        operations={operations}
      />
    ))}
  </div>
)

const RepositoryItem = ({ repository, operations }) => (
  <div className="border-b border-border" data-id={`repository-item-${repository.id}`}>
    <RepositoryHeader repository={repository} operations={operations} />
    {repository.isExpanded && (
      <>
        <RepositoryStatus repository={repository} />
        <StashList repository={repository} stashes={repository.stashes} />
      </>
    )}
  </div>
)

const RepositoryHeader = ({ repository, operations }) => {
  const handleClick = useCallback(() => operations.toggle(repository), [repository, operations]) 

  const handleRemove = useCallback((e) => {
    e.stopPropagation()
    operations.remove(repository)
  }, [repository, operations])

  const [firstCharacter, secondCharacter] = repository.name.split('-') || ['', '']

  return (
    <div
      className="flex justify-between items-center gap-2 p-2 group/repository-header overflow-hidden"
      data-id={`repository-header-${repository.id}`}
    >
      <button
        className="flex items-center gap-2 overflow-hidden cursor-pointer"
        title={repository.path}
        onClick={handleClick}
        type="button"
      >
        <span className="flex items-center justify-center gap-1 bg-primary-text rounded-md p-1 size-8 shrink-0 border border-border">
          {firstCharacter?.toUpperCase().slice(0, 1)}{secondCharacter?.toUpperCase().slice(0, 1)}
        </span>
        <span>{repository.name}</span>
      </button>
      <button 
        title="Remove Repository"
        onClick={handleRemove}
        data-id={`remove-repository-btn-${repository.id}`}
        type="button"
        className="font-bold text-red-500 cursor-pointer translate-x-10 group-hover/repository-header:translate-x-0 transition-transform duration-300"
      >
        DEL
      </button>
    </div>
  )
}

export default RepositoriesPanel
