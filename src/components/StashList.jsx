import React from 'react'
import { useApp } from '../context/AppContext'
import StashItem from './StashItem'

function StashList({ repository, stashes }) {
  if (stashes === 'loading') {
    return (
      <div className="px-6 py-4 text-center text-sm opacity-70 italic" data-id={`stash-list-loading-${repository.id}`}>
        Loading stashes...
      </div>
    )
  }

  if (!stashes || stashes.length === 0) {
    return (
      <div className="px-6 py-4 text-center text-sm opacity-70 italic" data-id={`stash-list-empty-${repository.id}`}>
        <div className="text-2xl mb-1">📭</div>
        No stashes found
      </div>
    )
  }

  return (
    <div data-id={`stash-list-${repository.id}`}>
      {stashes.map((stash, index) => (
        <StashItem 
          key={`${repository.id}-${index}`}
          repository={repository}
          stash={stash}
          index={index}
        />
      ))}
    </div>
  )
}

export default StashList