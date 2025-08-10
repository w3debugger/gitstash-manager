import { use, useState, useEffect, useMemo, useCallback, Fragment } from 'react'
import classNames from 'classnames'
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

    // Only load content when a file is selected
    if (!selectedFile) {
      setContent('')
      return
    }

    setLoading(true)
    await contentOps.loadFile()
    setLoading(false)
  }, [selectedRepository, selectedStash, selectedFile, contentOps])

  // Memoized visibility check
  const shouldShow = useMemo(() => 
    selectedRepository && selectedStash !== null, 
    [selectedRepository, selectedStash]
  )

  // Only show content when a file is selected
  const shouldShowContent = useMemo(() => 
    shouldShow && selectedFile !== null,
    [shouldShow, selectedFile]
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
      {shouldShowContent ? (
        <ContentDisplay loading={loading} content={content} />
      ) : (
        <div className="flex-1 flex items-center justify-center text-on-surface-variant">
          <div className="text-center">
            <div className="text-4xl mb-4">📁</div>
            <div className="text-lg font-medium mb-2">No File Selected</div>
            <div className="text-sm">Select a file from the left panel to view its changes</div>
          </div>
        </div>
      )}
    </div>
  )
}

// Extracted content display component
const ContentDisplay = ({ loading, content }) => (
  <div
    data-id="stash-content-display"
    className="flex-1 overflow-y-auto bg-surface leading-relaxed relative"
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

const getLineStyle = (line) => {
  if (line.added) {
    return 'bg-[var(--color-success)] text-[var(--color-on-success)]'
  }
  if (line.removed) {
    return 'bg-[var(--color-error)] text-[var(--color-on-error)]'
  }
  return ''
}

const ContentText = ({ content }) => {
  if (content.length === 0) return null

  return (
    <pre 
      // className="whitespace-pre-wrap break-words text-on-surface" 
      data-id="stash-content-text"
      className="grid grid-cols-[auto_auto_1fr] items-center"
    >
      {content.map((cont) => {  
        return (
          <Fragment key={cont.head.added}>
            <div className="bg-surface-variant p-2 overflow-hidden col-span-3 sticky top-0 z-10 shadow-lg">
              <div className="truncate">{cont.head.title}</div>
            </div>

            {cont.lines.map((line, index) => (
              <Fragment key={index}>
                <div
                  className={classNames(
                    'text-center py-0.5 px-2',
                    getLineStyle(line),
                  )}
                >
                  {line.removedIndex || ' '}
                </div>
                <div
                  className={classNames(
                    'text-center py-0.5 px-2',
                    getLineStyle(line),
                  )}
                >
                  {line.addedIndex || ' '}
                </div>
                <div
                  className={classNames(
                    'py-0.5',
                    'truncate whitespace-pre',
                    getLineStyle(line),
                  )}
                >
                  {line.line}
                </div>
              </Fragment>
            ))}
          </Fragment>
        )
      })}
    </pre>
  )
}

export default StashDetailsView
