const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Repository management
  getRepositories: () => ipcRenderer.invoke('get-repositories'),
  removeRepository: (repoId) => ipcRenderer.invoke('remove-repository', repoId),
  addRepositoryDialog: () => ipcRenderer.invoke('add-repository-dialog'),
  
  // Git operations
  getStashes: (repoPath) => ipcRenderer.invoke('get-stashes', repoPath),
  getStashContent: (repoPath, index) => ipcRenderer.invoke('get-stash-content', repoPath, index),
  getStashFiles: (repoPath, index) => ipcRenderer.invoke('get-stash-files', repoPath, index),
  getStashFileContent: (repoPath, index, filename) => ipcRenderer.invoke('get-stash-file-content', repoPath, index, filename),
  applyStash: (repoPath, index) => ipcRenderer.invoke('apply-stash', repoPath, index),
  dropStash: (repoPath, index) => ipcRenderer.invoke('drop-stash', repoPath, index),
  getRepoStatus: (repoPath) => ipcRenderer.invoke('get-repo-status', repoPath),
  
  // Event listeners
  onRepositoryAdded: (callback) => ipcRenderer.on('repository-added', callback),
  onRefreshRequested: (callback) => ipcRenderer.on('refresh-requested', callback),
  
  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});