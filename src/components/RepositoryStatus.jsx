import { useEffect, useState, useCallback, useMemo } from 'react'
import classNames from 'classnames'
import Button from './ui/Button'

const useRepositoryStatus = (repository) => {
  const [status, setStatus] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadStatus = useCallback(async () => {
    if (!repository?.path) {
      setStatus(null)
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      
      const { success, status, error: apiError } = await window.electronAPI.getRepoStatus(repository.path)
      
      if (success) {
        setStatus(status)
      } else {
        setError(apiError || 'Failed to load status')
        setStatus(null)
      }
    } catch (err) {
      setError(`Error: ${err.message}`)
      setStatus(null)
    } finally {
      setIsLoading(false)
    }
  }, [repository?.path])

  const stashChanges = useCallback(async () => {
    if (!repository?.path || status?.isClean) return false

    try {
      setIsLoading(true)
      setError(null)
      
      const { success, error: apiError } = await window.electronAPI.stashChanges(repository.path)
      
      if (success) {
        await loadStatus() // Refresh after stashing
        return true
      } else {
        setError(apiError || 'Failed to stash changes')
        return false
      }
    } catch (err) {
      setError(`Error: ${err.message}`)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [repository?.path, status?.isClean, loadStatus])

  useEffect(() => {
    loadStatus()
  }, [repository?.path])

  return { status, isLoading, error, loadStatus, stashChanges }
}

const RepositoryStatus = ({ repository }) => {
  const { status, isLoading, error, loadStatus, stashChanges } = useRepositoryStatus(repository)

  const changedFiles = useMemo(() => {
    if (!status) return []
    
    // Handle different ways the status might be structured
    if (status.files && Array.isArray(status.files)) {
      return status.files
    }
    
    return []
      .concat(
        status.modified || [],
        status.not_added || [],
        status.deleted || [],
        status.staged || [],
        status.created || [],
        status.conflicted || [],
        status.renamed || []
      )
      .filter(Boolean) // Remove any null/undefined entries
  }, [status])

  if (!repository) {
    return <div className="p-4 text-center text-gray-500">No repository selected</div>
  }

  if (isLoading) {
    return (
      <div className="p-4 text-center bg-surface-variant border border-border mx-2 mb-4 rounded-lg">
        Loading current changes...
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 text-center bg-surface-variant border border-border mx-2 mb-4 rounded-lg">
        <div className="text-red-600 mb-2">
          {error}
        </div>
        <Button onClick={loadStatus} variant="secondary" size="xs">
          Retry
        </Button>
      </div>
    )
  }

  if (!status || status.isClean) {
    return (
      <div className="p-4 bg-surface-variant border border-border mx-2 mb-4 rounded-lg text-center text-gray-500">
        Working directory is clean
      </div>
    )
  }

  return (
    <div className="p-4 bg-surface-variant border border-border mx-2 mb-4 rounded-lg">
      <FilesList files={changedFiles} />

      <Button
        onClick={stashChanges}
        variant="primary"
        className="w-full"
        disabled={isLoading || changedFiles.length === 0}
      >
        Stash {changedFiles.length} Change{changedFiles.length !== 1 ? 's' : ''}
      </Button>
    </div>
  )
}

const getStatusIcon = (status) => {
  switch (true) {
    case status.startsWith('?'):
      return {
        icon: '❓',
        color: 'text-blue-500',
        label: 'Untracked',
      }
    case status.startsWith('M'):
      return {
        icon: '📝',
        color: 'text-yellow-500',
        label: 'Modified',
      }
    case status.startsWith('A'):
      return {
        icon: '➕',
        color: 'text-green-500',
        label: 'Added',
      }
    case status.startsWith('D'):
      return {
        icon: '➖',
        color: 'text-red-500',
        label: 'Deleted',
      }
    default:
      return {
        icon: '📄',
        color: 'text-gray-500',
        label: 'Changed',
      }
  }
}

const FilesList = ({ files }) => {
  if (!files || files.length === 0) return null

  return (
    <div className="mb-4">
      <h3 className="mb-2 flex items-center">
        Changed Files ({files.length}):
      </h3>
      <div className="max-h-96 overflow-y-auto">
        <ul className="space-y-1">
          {files.map((file) => {
            const statusInfo = getStatusIcon(file.index.trim() || file.working_dir.trim())
            const splitPath = file.path.split('/')
            const filePath = splitPath.slice(0, -1).join('/')
            const fileName = splitPath[splitPath.length - 1]

            return (
              <li
                key={file.path}
                title={file?.path}
                className="flex items-center overflow-hidden"
              >
                <span
                  title={statusInfo.label}
                  className={classNames(statusInfo.color, 'mr-2')}
                >
                  {statusInfo.icon}
                </span>
                {filePath.length > 0
                ? (
                  <>
                    <span className="truncate text-gray-500">
                      {filePath}
                    </span>
                    <span className="whitespace-nowrap">
                      /{fileName}
                    </span>
                  </>
                ) : (
                  <span className="whitespace-nowrap truncate">
                    {fileName}
                  </span>
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

export default RepositoryStatus
