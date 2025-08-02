import React from 'react'
import { useApp } from '../context/AppContext'
import StashItem from './StashItem'

function StashList({ repository, stashes }) {
  if (stashes === 'loading') {
    return (
      <div className="stashes-list">
        <div className="loading-stashes">Loading stashes...</div>
      </div>
    )
  }

  if (!stashes || stashes.length === 0) {
    return (
      <div className="stashes-list">
        <div className="empty-stashes">No stashes found</div>
      </div>
    )
  }

  return (
    <div className="stashes-list">
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