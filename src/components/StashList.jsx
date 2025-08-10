import { use, useCallback, useMemo } from 'react'
import classNames from 'classnames'
import { AppContext } from '../context/AppContext'

const computeNextSelectedStash = ({
  droppedIndex,
  prevLength,
  wasSelected,
  currentSelectedIndex,
}) => {
  const hadItems = prevLength > 0
  const newLength = Math.max(prevLength - 1, 0)
  const prevLast = Math.max(prevLength - 1, -1)

  if (!hadItems || newLength === 0) return null

  // If we dropped before the current selection, selection shifts left by 1
  if (!wasSelected && currentSelectedIndex != null && droppedIndex < currentSelectedIndex) {
    return Math.max(0, currentSelectedIndex - 1)
  }

  // If we dropped after the current selection, selection stays as-is
  if (!wasSelected && currentSelectedIndex != null && droppedIndex > currentSelectedIndex) {
    return currentSelectedIndex
  }

  // We dropped the currently selected stash
  if (wasSelected) {
    // If we didn't drop the last, select the item that slid into this index
    if (droppedIndex < prevLast) return droppedIndex
    // If we dropped the last, select the new last (previous index - 1)
    return Math.max(0, droppedIndex - 1)
  }

  // If there was no selection before, pick something sensible:
  // Prefer the item that slid into the dropped slot (if not last), else new last.
  return droppedIndex < prevLast ? droppedIndex : Math.max(0, prevLast - 1)
}

const StashList = ({ repository, stashes }) => {
  const { 
    selectedRepository,
    selectedStash,
    setRepositoryStashes,
    batchUpdate
  } = use(AppContext)

  const repoSelected = selectedRepository?.id === repository.id

  const stashOps = useMemo(() => ({
    select(index) {
      batchUpdate([
        { type: 'SET_SELECTED_REPOSITORY', payload: repository },
        { type: 'SET_SELECTED_STASH', payload: index }
        // Don't automatically clear selected file - let user choose when to view file vs stash
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

      // Capture current length BEFORE dropping so we can compute next selection correctly
      const prevLength = Array.isArray(stashes) ? stashes.length : 0
      const wasSelected = repoSelected && selectedStash === index
      const currentSelectedIndex = repoSelected ? selectedStash : null

      try {
        const { success, message, error } = await window.electronAPI.dropStash(repository.path, index)
        if (!success) {
          console.error('Failed to drop stash:', error)
          return
        }

        console.log('Stash dropped successfully:', message)

        // Reload stashes (source of truth)
        const stashResult = await window.electronAPI.getStashes(repository.path)
        if (!stashResult.success) {
          console.error('Failed to reload stashes after drop')
          return
        }

        setRepositoryStashes(repository.id, stashResult.stashes)

        // Compute and apply the next selection based on your rules
        if (repoSelected) {
          const nextIndex = computeNextSelectedStash({
            droppedIndex: index,
            prevLength,
            wasSelected,
            currentSelectedIndex,
          })

          batchUpdate([
            // keep repo selected
            { type: 'SET_SELECTED_REPOSITORY', payload: repository },
            { type: 'SET_SELECTED_STASH', payload: nextIndex },
            { type: 'SET_SELECTED_FILE', payload: null },
          ])
        }
      } catch (error) {
        console.error('Error dropping stash:', error)
      }
    }
  }), [repository, repoSelected, selectedStash, stashes, batchUpdate, setRepositoryStashes])

  const processedStashes = useMemo(() => 
    Array.isArray(stashes) 
      ? stashes.map((stash, index) => ({
          ...stash,
          index,
          isSelected: repoSelected && selectedStash === index,
          key: `${repository.id}-${index}`,
          dataId: `stash-item-${repository.id}-${index}`
        }))
      : [],
    [stashes, repoSelected, repository.id, selectedStash]
  )

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
      className="font-bold text-on-success"
    >
      APPLY
    </button>
    <button 
      title="Drop Stash"
      onClick={onDrop}
      data-id={`drop-stash-btn-${repository.id}-${stash.index}`}
      type="button"
      className="font-bold text-on-error"
    >
      DROP
    </button>
  </div>
)

export default StashList
