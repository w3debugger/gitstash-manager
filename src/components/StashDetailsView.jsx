import { use, useState, useEffect, useMemo, useCallback } from 'react'
import { AppContext } from '../context/AppContext'

const StashDetailsView = () => {
  const { selectedRepository, selectedStash, selectedFile } = use(AppContext)
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)

  // Memoized content operations
  const contentOps = useMemo(() => ({
    async loadFile() {
      // Validate required parameters before making API call
      if (!selectedRepository?.path || selectedStash === null || !selectedFile?.filename) {
        console.warn('Invalid parameters for loadFile:', { 
          repository: selectedRepository?.path, 
          stash: selectedStash, 
          filename: selectedFile?.filename 
        })
        setContent('Invalid file parameters')
        return
      }

      // Handle deleted files - don't try to load content
      if (selectedFile.status === 'Deleted' || selectedFile.rawStatus?.startsWith('D')) {
        setContent(`📁 ${selectedFile.filename}\n\n❌ This file was deleted in this stash.\n\nNo content available to display.`)
        return
      }

      if (selectedFile.status === 'Added' || selectedFile.rawStatus?.startsWith('A')) {
        setContent(`📁 ${selectedFile.filename}\n\n➕ This file was added in this stash.\n\nLoading content...`)
      }

      try {
        const { success, content, error } = await window.electronAPI.getStashFileContent(
          selectedRepository.path, 
          selectedStash, 
          selectedFile.filename
        )
        
        if (success) {
          setContent(content)
        } else {
          setContent(`Error loading file content: ${error}`)
          console.error('Failed to load file content:', error)
        }
      } catch (error) {
        console.error('Error loading file content:', error)
        setContent('Error loading file content')
      }
    },

    async loadStash() {
      // Validate required parameters before making API call
      if (!selectedRepository?.path || selectedStash === null) {
        console.warn('Invalid parameters for loadStash:', { 
          repository: selectedRepository?.path, 
          stash: selectedStash 
        })
        setContent('Invalid stash parameters')
        return
      }

      try {
        const { success, content, error } = await window.electronAPI.getStashContent(
          selectedRepository.path, 
          selectedStash
        )
        
        if (success) {
          setContent(content)
        } else {
          setContent(`Error loading stash content: ${error}`)
          console.error('Failed to load stash content:', error)
        }
      } catch (error) {
        console.error('Error loading stash content:', error)
        setContent('Error loading stash content')
      }
    }
  }), [selectedRepository?.path, selectedStash, selectedFile?.filename])

  // Optimized content loading
  const loadContent = useCallback(async () => {
    if (!selectedRepository || selectedStash === null) {
      setContent('👈 Select a stash from the repositories panel to view its changes')
      return
    }

    setLoading(true)
    
    if (selectedFile) {
      await contentOps.loadFile()
    } else {
      await contentOps.loadStash()
    }
    
    setLoading(false)
  }, [selectedRepository, selectedStash, selectedFile, contentOps])

  // Memoized visibility check
  const shouldShow = useMemo(() => 
    selectedRepository && selectedStash !== null, 
    [selectedRepository, selectedStash]
  )

  useEffect(() => {
    loadContent()
  }, [loadContent])

  if (!shouldShow) return null

  return (
    <div
      data-id="stash-details-view"
      className="flex-1 m-0 bg-surface flex flex-col h-full overflow-hidden"
    >
      <ContentDisplay loading={loading} content={content} />
    </div>
  )
}

// Extracted content display component
const ContentDisplay = ({ loading, content }) => (
  <div
    data-id="stash-content-display"
    className="flex-1 overflow-y-auto bg-surface p-5 leading-relaxed"
  >
    {loading ? (
      <LoadingState />
    ) : (
      <ContentText content={content} />
    )}
  </div>
)

const LoadingState = () => (
  <div 
    className="flex items-center justify-center h-full text-on-surface-variant" 
    data-id="stash-content-loading"
  >
    Loading...
  </div>
)

const ContentText = ({ content }) => {
  // Split content into lines and process each line
  const lines = content.split('\n')
  
  return (
    <pre 
      className="whitespace-pre-wrap break-words text-on-surface" 
      data-id="stash-content-text"
    >
      {lines.map((line, index) => {
        // Determine line type (added, removed, or normal)
        const isAddedLine = line.startsWith('+')
        const isRemovedLine = line.startsWith('-')
        
        // Style based on line type
        const lineStyle = isAddedLine ? 'text-[var(--color-diff-added)]' 
          : isRemovedLine ? 'text-[var(--color-diff-removed)]'
          : 'text-on-surface'
          
        return (
          <div key={index} className={`${lineStyle} flex`}>
            <span className="w-12 text-right pr-4 text-gray-500 select-none">{index + 1}</span>
            <span>{line}</span>
          </div>
        )
      })}
    </pre>
  )
}

export default StashDetailsView
