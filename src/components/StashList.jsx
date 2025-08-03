import { use, useCallback, useMemo } from 'react'
import classNames from 'classnames'
import { AppContext } from '../context/AppContext'

const StashList = ({ repository, stashes }) => {
  const { 
    selectedRepository,
    selectedStash,
    setRepositoryStashes,
    batchUpdate
  } = use(AppContext)

  // Memoized stash operations
  const stashOps = useMemo(() => ({
    select(index) {
      batchUpdate([
        { type: 'SET_SELECTED_REPOSITORY', payload: repository },
        { type: 'SET_SELECTED_STASH', payload: index },
        { type: 'SET_SELECTED_FILE', payload: null }
      ])
    },

    async apply(index) {
      const confirmed = window.confirm(
        `Are you sure you want to apply stash@{${index}} from ${repository.name}?`
      )
      if (!confirmed) return

      try {
        const { success, message, error } = await window.electronAPI.applyStash(repository.path, index)
        
        if (success) {
          console.log('Stash applied successfully:', message)
        } else {
          console.error('Failed to apply stash:', error)
        }
      } catch (error) {
        console.error('Error applying stash:', error)
      }
    },

    async drop(index) {
      const confirmed = window.confirm(
        `Are you sure you want to permanently delete stash@{${index}} from ${repository.name}? This action cannot be undone!`
      )
      if (!confirmed) return

      try {
        const { success, message, error } = await window.electronAPI.dropStash(repository.path, index)
        
        if (success) {
          console.log('Stash dropped successfully:', message)
          
          // Clear selection if we dropped the selected stash
          if (selectedRepository?.id === repository.id && selectedStash === index) {
            batchUpdate([
              { type: 'SET_SELECTED_STASH', payload: null },
              { type: 'SET_SELECTED_FILE', payload: null }
            ])
          }
          
          // Reload stashes
          const stashResult = await window.electronAPI.getStashes(repository.path)
          if (stashResult.success) {
            setRepositoryStashes(repository.id, stashResult.stashes)
          }
        } else {
          console.error('Failed to drop stash:', error)
        }
      } catch (error) {
        console.error('Error dropping stash:', error)
      }
    }
  }), [repository, selectedRepository?.id, selectedStash, batchUpdate, setRepositoryStashes])

  // Memoized processed stashes
  const processedStashes = useMemo(() => 
    Array.isArray(stashes) 
      ? stashes.map((stash, index) => ({
          ...stash,
          index,
          isSelected: selectedRepository?.id === repository.id && selectedStash === index,
          key: `${repository.id}-${index}`,
          dataId: `stash-item-${repository.id}-${index}`
        }))
      : [],
    [stashes, selectedRepository?.id, repository.id, selectedStash]
  )

  // Early returns for different states
  if (stashes === 'loading') {
    return <LoadingState repository={repository} />
  }

  if (!stashes || stashes.length === 0) {
    return <EmptyState repository={repository} />
  }

  return (
    <div data-id={`stash-list-${repository.id}`} className="flex flex-col -mt-2">
      {processedStashes.map((stash, index) => (
        <StashItem 
          key={stash.key}
          stash={stash}
          repository={repository}
          operations={stashOps}
          isLast={index === processedStashes.length - 1}
        />
      ))}
    </div>
  )
}

// Extracted components for better performance
const LoadingState = ({ repository }) => (
  <div className="px-6 py-4" data-id={`stash-list-loading-${repository.id}`}>
    Loading stashes...
  </div>
)

const EmptyState = ({ repository }) => (
  <div className="px-6 py-4" data-id={`stash-list-empty-${repository.id}`}>
    <div className="text-2xl mb-1">📭</div>
    No stashes found
  </div>
)

const StashItem = ({ stash, repository, operations, isLast }) => {
  const handleSelect = useCallback(() => operations.select(stash.index), [operations, stash.index])
  const handleApply = useCallback((e) => {
    e.stopPropagation()
    operations.apply(stash.index)
  }, [operations, stash.index])
  
  const handleDrop = useCallback((e) => {
    e.stopPropagation()
    operations.drop(stash.index)
  }, [operations, stash.index])

  return (
    <div 
      className={classNames(
        'flex items-center gap-2 ml-5 py-1 pr-2 group/stash-item overflow-hidden',
        stash.isSelected && 'bg-hover',
      )}
    >
      <div>{isLast ? '└─' : '├─'}</div>
      <button
        className="truncate cursor-pointer"
        type="button"
        onClick={handleSelect}
        data-id={stash.dataId}
      >
        {stash.index}: {stash.message}
      </button>

      <StashActions 
        repository={repository}
        stash={stash}
        onApply={handleApply}
        onDrop={handleDrop}
      />
    </div>
  )
}

const StashActions = ({ repository, stash, onApply, onDrop }) => (
  <div className="flex gap-1 opacity-0 -mr-20 group-hover/stash-item:mr-0 group-hover/stash-item:opacity-100 transition-margin duration-300">
    <button 
      title="Apply Stash"
      onClick={onApply}
      data-id={`apply-stash-btn-${repository.id}-${stash.index}`}
      type="button"
      className="text-green-500"
    >
      APPLY
    </button>
    <button 
      title="Drop Stash"
      onClick={onDrop}
      data-id={`drop-stash-btn-${repository.id}-${stash.index}`}
      type="button"
      className="font-bold text-red-500"
    >
      DROP
    </button>
  </div>
)

export default StashList
