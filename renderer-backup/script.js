class GitStashElectionApp {
    constructor() {
        this.selectedRepository = null;
        this.selectedStash = null;
        this.selectedFile = null;
        this.repositories = [];
        this.repositoryStashes = {}; // Store stashes per repository
        this.repositoryExpanded = {}; // Track expanded state per repository
        this.files = [];
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadRepositories();
        this.setupElectronListeners();
    }

    bindEvents() {
        // Repository management
        document.getElementById('add-repo-btn').addEventListener('click', () => {
            this.addRepository();
        });
        
        document.getElementById('add-repo-btn-header').addEventListener('click', () => {
            this.addRepository();
        });
        
        document.getElementById('add-first-repo').addEventListener('click', () => {
            this.addRepository();
        });
        
        document.getElementById('welcome-add-repo').addEventListener('click', () => {
            this.addRepository();
        });

        // Refresh functionality
        document.getElementById('refresh-btn').addEventListener('click', () => {
            this.refreshAllRepositories();
        });

        // Stash actions are now handled inline with each stash item in the tree
    }

    setupElectronListeners() {
        // Listen for repository added from main process
        window.electronAPI.onRepositoryAdded((event, repo) => {
            this.loadRepositories();
            this.showNotification(`Repository "${repo.name}" added successfully!`, 'success');
        });

        // Listen for refresh requests from main process
        window.electronAPI.onRefreshRequested(() => {
            this.refreshCurrentRepository();
        });
    }

    async loadRepositories() {
        try {
            this.repositories = await window.electronAPI.getRepositories();
            this.renderRepositories();
            
            // Update welcome screen visibility
            this.updateWelcomeScreen();
        } catch (error) {
            console.error('Error loading repositories:', error);
            this.showNotification('Failed to load repositories', 'error');
        }
    }

    renderRepositories() {
        const repositoriesTree = document.getElementById('repositories-tree');
        
        if (this.repositories.length === 0) {
            repositoriesTree.innerHTML = `
                <div class="empty-repositories">
                    <div class="empty-icon">📁</div>
                    <p>No repositories added</p>
                    <button id="add-first-repo" class="add-first-repo">Add Repository</button>
                </div>
            `;
            
            // Re-bind the event listener
            document.getElementById('add-first-repo').addEventListener('click', () => {
                this.addRepository();
            });
            return;
        }

        repositoriesTree.innerHTML = this.repositories.map(repo => {
            const isExpanded = this.repositoryExpanded[repo.id];
            const stashes = this.repositoryStashes[repo.id] || [];
            
            return `
                <div class="repository-tree-item ${isExpanded ? 'expanded' : ''}" data-repo-id="${repo.id}">
                    <div class="repository-header" data-repo-id="${repo.id}">
                        <div class="repo-info">
                            <div class="repo-name">
                                📂 ${repo.name}
                            </div>
                            <div class="repo-path">${repo.path}</div>
                        </div>
                        <div class="repo-actions">
                            <button class="repo-action-btn refresh" data-repo-id="${repo.id}" title="Refresh Repository">
                                🔄
                            </button>
                            <button class="repo-action-btn remove" data-repo-id="${repo.id}" title="Remove Repository">
                                ✕
                            </button>
                        </div>
                    </div>
                    <div class="repository-stashes ${isExpanded ? 'expanded' : ''}" data-repo-id="${repo.id}">
                        <div class="stashes-container">
                            ${this.renderRepositoryStashes(repo.id, stashes)}
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        this.bindRepositoryEvents();
    }

    renderRepositoryStashes(repoId, stashes) {
        if (stashes === 'loading') {
            return `
                <div class="stashes-loading">
                    Loading stashes...
                </div>
            `;
        }

        if (!stashes || stashes.length === 0) {
            return `
                <div class="stashes-empty">
                    No stashes found
                </div>
            `;
        }

        return stashes.map((stash, index) => `
            <div class="tree-stash-item ${this.selectedRepository?.id === repoId && this.selectedStash === index ? 'selected' : ''}" 
                 data-repo-id="${repoId}" data-stash-index="${index}">
                <div class="stash-content">
                    <div class="stash-sidebar-header">
                        <span class="stash-sidebar-index">#${index}</span>
                        <span class="stash-sidebar-hash">${stash.hash?.substring(0, 7) || 'unknown'}</span>
                    </div>
                    <div class="stash-sidebar-message">${stash.message || 'No message'}</div>
                    <div class="stash-sidebar-date">${stash.date || 'Unknown date'}</div>
                </div>
                <div class="stash-actions">
                    <button class="stash-action-btn apply" data-repo-id="${repoId}" data-stash-index="${index}" title="Apply Stash">
                        ✅
                    </button>
                    <button class="stash-action-btn drop" data-repo-id="${repoId}" data-stash-index="${index}" title="Drop Stash">
                        🗑️
                    </button>
                </div>
            </div>
        `).join('');
    }

    bindRepositoryEvents() {
        const repositoriesTree = document.getElementById('repositories-tree');
        
        // Repository expand/collapse events
        repositoriesTree.querySelectorAll('.repository-header').forEach(element => {
            element.addEventListener('click', (e) => {
                const repoId = element.dataset.repoId;
                
                // Don't trigger if clicking on action buttons
                if (e.target.classList.contains('repo-action-btn')) {
                    return;
                }
                
                this.toggleRepository(repoId);
            });
        });

        // Repository action events
        repositoriesTree.querySelectorAll('.repo-action-btn.remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const repoId = btn.dataset.repoId;
                this.removeRepository(repoId);
            });
        });

        repositoriesTree.querySelectorAll('.repo-action-btn.refresh').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const repoId = btn.dataset.repoId;
                this.refreshRepository(repoId);
            });
        });

        // Stash selection events
        repositoriesTree.querySelectorAll('.tree-stash-item .stash-content').forEach(content => {
            content.addEventListener('click', (e) => {
                const stashItem = content.closest('.tree-stash-item');
                const repoId = stashItem.dataset.repoId;
                const stashIndex = parseInt(stashItem.dataset.stashIndex);
                
                const repo = this.repositories.find(r => r.id === repoId);
                this.selectRepositoryAndStash(repo, stashIndex);
            });
        });

        // Stash action events
        repositoriesTree.querySelectorAll('.stash-action-btn.apply').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const repoId = btn.dataset.repoId;
                const stashIndex = parseInt(btn.dataset.stashIndex);
                this.applyStashFromTree(repoId, stashIndex);
            });
        });

        repositoriesTree.querySelectorAll('.stash-action-btn.drop').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const repoId = btn.dataset.repoId;
                const stashIndex = parseInt(btn.dataset.stashIndex);
                this.dropStashFromTree(repoId, stashIndex);
            });
        });
    }

    updateWelcomeScreen() {
        const welcomeScreen = document.getElementById('welcome-screen');
        const repoHeader = document.getElementById('repo-header');
        const stashDetailsView = document.getElementById('stash-details-view');
        const filesSidebar = document.getElementById('files-sidebar');
        
        if (this.repositories.length === 0) {
            welcomeScreen.style.display = 'flex';
            repoHeader.style.display = 'none';
            stashDetailsView.style.display = 'none';
            filesSidebar.style.display = 'none';
        } else {
            welcomeScreen.style.display = 'none';
            if (this.selectedRepository) {
                repoHeader.style.display = 'flex';
                stashDetailsView.style.display = 'flex';
                filesSidebar.style.display = 'flex';
            } else {
                repoHeader.style.display = 'none';
                stashDetailsView.style.display = 'none';
                filesSidebar.style.display = 'none';
            }
        }
    }

    toggleRepository(repoId) {
        const isCurrentlyExpanded = this.repositoryExpanded[repoId];
        this.repositoryExpanded[repoId] = !isCurrentlyExpanded;
        
        // If expanding and we don't have stashes loaded, load them
        if (!isCurrentlyExpanded && !this.repositoryStashes[repoId]) {
            this.loadRepositoryStashes(repoId);
        } else {
            // Just re-render to update the visual state
            this.renderRepositories();
        }
    }

    async loadRepositoryStashes(repoId) {
        const repo = this.repositories.find(r => r.id === repoId);
        if (!repo) return;

        try {
            // Show loading state
            this.repositoryStashes[repoId] = 'loading';
            this.renderRepositories();

            const result = await window.electronAPI.getStashes(repo.path);
            
            if (result.success) {
                this.repositoryStashes[repoId] = result.stashes;
            } else {
                this.repositoryStashes[repoId] = [];
                this.showNotification(`Failed to load stashes for ${repo.name}: ${result.error}`, 'error');
            }
            
            this.renderRepositories();
        } catch (error) {
            console.error('Error loading repository stashes:', error);
            this.repositoryStashes[repoId] = [];
            this.renderRepositories();
            this.showNotification(`Failed to load stashes for ${repo.name}`, 'error');
        }
    }

    selectRepositoryAndStash(repository, stashIndex) {
        // Update repository selection
        this.selectedRepository = repository;
        this.selectedStash = stashIndex;
        this.selectedFile = null;

        // Update header
        document.getElementById('current-repo-name').textContent = repository.name;
        document.getElementById('current-repo-path').textContent = repository.path;

        // Show main panels
        this.updateWelcomeScreen();

        // Load files
        this.loadStashFiles();

        // Re-render repositories to update selection visual state
        this.renderRepositories();
    }

    async applyStashFromTree(repoId, stashIndex) {
        const repo = this.repositories.find(r => r.id === repoId);
        if (!repo) return;

        const confirmed = confirm(`Are you sure you want to apply stash@{${stashIndex}} from ${repo.name}?`);
        if (!confirmed) return;

        try {
            const result = await window.electronAPI.applyStash(repo.path, stashIndex);
            
            if (result.success) {
                this.showNotification(result.message, 'success');
            } else {
                this.showNotification(result.error || 'Failed to apply stash', 'error');
            }
        } catch (error) {
            console.error('Error applying stash:', error);
            this.showNotification('Failed to apply stash', 'error');
        }
    }

    async dropStashFromTree(repoId, stashIndex) {
        const repo = this.repositories.find(r => r.id === repoId);
        if (!repo) return;

        const confirmed = confirm(`Are you sure you want to permanently delete stash@{${stashIndex}} from ${repo.name}? This action cannot be undone!`);
        if (!confirmed) return;

        try {
            const result = await window.electronAPI.dropStash(repo.path, stashIndex);
            
            if (result.success) {
                this.showNotification(result.message, 'success');
                
                // Clear selection if we dropped the selected stash
                if (this.selectedRepository?.id === repoId && this.selectedStash === stashIndex) {
                    this.selectedStash = null;
                    this.selectedFile = null;
                    document.getElementById('stash-details').textContent = '👈 Select a stash from the sidebar to view its changes';
                    document.getElementById('files-list').innerHTML = '<div class="loading-files">Select a stash to view files</div>';
                    document.getElementById('files-count').textContent = '0 files';
                }
                
                // Reload stashes for this repository
                await this.loadRepositoryStashes(repoId);
            } else {
                this.showNotification(result.error || 'Failed to drop stash', 'error');
            }
        } catch (error) {
            console.error('Error dropping stash:', error);
            this.showNotification('Failed to drop stash', 'error');
        }
    }

    async refreshRepository(repoId) {
        const repo = this.repositories.find(r => r.id === repoId);
        if (!repo) return;

        this.showNotification(`Refreshing ${repo.name}...`, 'info');
        
        // Clear and reload stashes for this repository
        delete this.repositoryStashes[repoId];
        
        if (this.repositoryExpanded[repoId]) {
            await this.loadRepositoryStashes(repoId);
        }
        
        // If this is the selected repository, refresh its data
        if (this.selectedRepository?.id === repoId && this.selectedStash !== null) {
            await this.loadStashFiles();
        }
        
        this.showNotification(`${repo.name} refreshed!`, 'success');
    }

    async refreshAllRepositories() {
        this.showNotification('Refreshing all repositories...', 'info');
        
        // Clear all repository stashes
        this.repositoryStashes = {};
        
        // Reload expanded repositories
        for (const repoId of Object.keys(this.repositoryExpanded)) {
            if (this.repositoryExpanded[repoId]) {
                await this.loadRepositoryStashes(repoId);
            }
        }
        
        // Refresh selected repository data
        if (this.selectedRepository && this.selectedStash !== null) {
            await this.loadStashFiles();
        }
        
        this.showNotification('All repositories refreshed!', 'success');
    }

    async addRepository() {
        try {
            await window.electronAPI.addRepositoryDialog();
            // The repository will be added via the electron listener
        } catch (error) {
            console.error('Error adding repository:', error);
            this.showNotification('Failed to add repository', 'error');
        }
    }

    async removeRepository(repoId) {
        try {
            await window.electronAPI.removeRepository(repoId);
            this.repositories = this.repositories.filter(repo => repo.id !== repoId);
            
            // If the removed repo was selected, clear selection
            if (this.selectedRepository && this.selectedRepository.id === repoId) {
                this.selectedRepository = null;
                this.clearSelection();
            }
            
            this.renderRepositories();
            this.updateWelcomeScreen();
            this.showNotification('Repository removed successfully', 'success');
        } catch (error) {
            console.error('Error removing repository:', error);
            this.showNotification('Failed to remove repository', 'error');
        }
    }

    async selectRepository(repository) {
        this.selectedRepository = repository;
        this.selectedStash = null;
        this.selectedFile = null;

        // Update header
        document.getElementById('current-repo-name').textContent = repository.name;
        document.getElementById('current-repo-path').textContent = repository.path;

        // Show main panels
        this.updateWelcomeScreen();

        // Expand the repository if not already expanded
        if (!this.repositoryExpanded[repository.id]) {
            this.repositoryExpanded[repository.id] = true;
            await this.loadRepositoryStashes(repository.id);
        }



        // Clear stash details
        document.getElementById('stash-details').textContent = '👈 Select a stash from the sidebar to view its changes';
        document.getElementById('files-list').innerHTML = '<div class="loading-files">Select a stash to view files</div>';
        document.getElementById('files-count').textContent = '0 files';

        // Re-render to update visual state
        this.renderRepositories();
    }

    // Legacy method - keeping for compatibility
    async loadRepositoryData() {
        // No longer needed, functionality moved to tree structure
    }

    // Legacy methods - keeping for compatibility but functionality moved to tree structure

    renderStashDetails(content) {
        const detailsEl = document.getElementById('stash-details');
        
        if (!content) {
            detailsEl.textContent = 'No content available';
            return;
        }

        // Apply basic diff syntax highlighting
        const lines = content.split('\n');
        let highlightedContent = '';
        
        for (const line of lines) {
            if (line.startsWith('diff --git') || line.startsWith('index ')) {
                highlightedContent += `<span class="diff-header">${this.escapeHtml(line)}</span>\n`;
            } else if (line.startsWith('+++') || line.startsWith('---')) {
                highlightedContent += `<span class="diff-file">${this.escapeHtml(line)}</span>\n`;
            } else if (line.startsWith('@@')) {
                highlightedContent += `<span class="diff-hunk">${this.escapeHtml(line)}</span>\n`;
            } else if (line.startsWith('+') && !line.startsWith('+++')) {
                highlightedContent += `<span class="diff-addition">${this.escapeHtml(line)}</span>\n`;
            } else if (line.startsWith('-') && !line.startsWith('---')) {
                highlightedContent += `<span class="diff-deletion">${this.escapeHtml(line)}</span>\n`;
            } else {
                highlightedContent += `<span class="diff-context">${this.escapeHtml(line)}</span>\n`;
            }
        }
        
        detailsEl.innerHTML = highlightedContent;
    }

    async loadStashFiles() {
        console.log('🔄 loadStashFiles called');
        console.log('📁 selectedRepository:', this.selectedRepository);
        console.log('📑 selectedStash:', this.selectedStash);
        
        if (!this.selectedRepository || this.selectedStash === null) {
            console.log('❌ Missing repository or stash selection');
            return;
        }

        try {
            console.log('🚀 Calling getStashFiles API...');
            console.log('📍 Repository path:', this.selectedRepository.path);
            console.log('📑 Stash index:', this.selectedStash);
            
            const result = await window.electronAPI.getStashFiles(this.selectedRepository.path, this.selectedStash);
            console.log('📦 getStashFiles API result:', result);
            console.log('📦 result.success:', result.success);
            console.log('📦 result.files:', result.files);
            console.log('📦 result.error:', result.error);
            
            if (result && result.success) {
                this.files = result.files || [];
                console.log('✅ Files successfully loaded into this.files:', this.files);
                console.log('📊 Number of files:', this.files.length);
                
                console.log('🎨 Calling renderFiles...');
                this.renderFiles();
                
                // Auto-select first file if available
                if (this.files.length > 0) {
                    console.log('🎯 Auto-selecting first file...');
                    await this.selectFile(0);
                } else {
                    console.log('⚠️ No files to auto-select');
                }
            } else {
                console.error('❌ API returned failure:', result);
                this.showNotification(`Failed to load files: ${result ? result.error : 'Unknown error'}`, 'error');
                this.files = [];
                this.renderFiles();
            }
        } catch (error) {
            console.error('💥 JavaScript error in loadStashFiles:', error);
            console.error('💥 Error stack:', error.stack);
            this.showNotification('Failed to load stash files: ' + error.message, 'error');
        }
    }

    renderFiles() {
        console.log('🎨 renderFiles called');
        console.log('📂 this.files:', this.files);
        
        const filesListEl = document.getElementById('files-list');
        const filesCountEl = document.getElementById('files-count');
        
        console.log('🔍 DOM elements:');
        console.log('📋 filesListEl:', filesListEl);
        console.log('🔢 filesCountEl:', filesCountEl);
        
        if (!filesListEl) {
            console.error('❌ files-list element not found!');
            return;
        }
        
        if (!filesCountEl) {
            console.error('❌ files-count element not found!');
            return;
        }
        
        if (!this.files) {
            console.log('⚠️ No files array');
            filesListEl.innerHTML = '<div class="empty-files">No files loaded</div>';
            filesCountEl.textContent = '0 files';
            return;
        }
        
        filesCountEl.textContent = `${this.files.length} file${this.files.length !== 1 ? 's' : ''}`;
        
        if (this.files.length === 0) {
            console.log('Files array is empty');
            filesListEl.innerHTML = `
                <div class="empty-files">
                    No files changed in this stash
                </div>
            `;
            return;
        }

        console.log('Rendering', this.files.length, 'files');
        
        filesListEl.innerHTML = this.files.map((file, index) => {
            const fileName = file.filename.split('/').pop();
            const filePath = file.filename.includes('/') ? file.filename.substring(0, file.filename.lastIndexOf('/')) : '';
            
            return `
                <div class="file-item" data-file-index="${index}">
                    <div class="file-item-header">
                        <span class="file-status-icon">${file.statusIcon}</span>
                        <span class="file-name">${fileName}</span>
                        <span class="file-status ${file.status.toLowerCase()}">${file.status}</span>
                    </div>
                    ${filePath ? `<div class="file-path">${filePath}</div>` : ''}
                </div>
            `;
        }).join('');

        console.log('Files HTML set:', filesListEl.innerHTML);

        // Add click events to file items
        filesListEl.querySelectorAll('.file-item').forEach(item => {
            item.addEventListener('click', () => {
                const fileIndex = parseInt(item.dataset.fileIndex);
                this.selectFile(fileIndex);
            });
        });
        
        console.log('File click events added');
    }

    async selectFile(fileIndex) {
        console.log('🎯 selectFile called with index:', fileIndex);
        
        if (!this.selectedRepository || this.selectedStash === null || !this.files[fileIndex]) {
            console.log('❌ Missing prerequisites for file selection');
            return;
        }

        // Update visual selection
        document.querySelectorAll('.file-item').forEach(item => {
            item.classList.remove('selected');
        });
        const selectedFileEl = document.querySelector(`[data-file-index="${fileIndex}"]`);
        if (selectedFileEl) {
            selectedFileEl.classList.add('selected');
        }

        this.selectedFile = fileIndex;
        const file = this.files[fileIndex];
        console.log('📁 Selected file:', file);

        // Load file-specific content
        try {
            console.log('🔄 Loading file content...');
            const result = await window.electronAPI.getStashFileContent(
                this.selectedRepository.path, 
                this.selectedStash, 
                file.filename
            );
            console.log('📦 File content result:', result);
            
            if (result.success) {
                this.renderStashDetails(result.content);
            } else {
                this.renderStashDetails(`Failed to load file content: ${result.error}`);
            }
        } catch (error) {
            console.error('💥 Error loading file content:', error);
            this.renderStashDetails('Failed to load file content: ' + error.message);
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Legacy methods replaced by tree-specific versions

    clearSelection() {
        // Clear repository header
        document.getElementById('current-repo-name').textContent = 'Select a Repository';
        document.getElementById('current-repo-path').textContent = 'Choose a repository from the sidebar to view its stashes';
        
        // Clear stash selection
        this.selectedRepository = null;
        this.selectedStash = null;
        this.selectedFile = null;
        
        // Clear stash details
        document.getElementById('stash-details').textContent = '👈 Select a stash from the sidebar to view its changes';
        
        // Clear files list
        document.getElementById('files-list').innerHTML = '<div class="loading-files">Select a stash to view files</div>';
        document.getElementById('files-count').textContent = '0 files';
        
        // Re-render repositories to update visual state
        this.renderRepositories();
        
        this.updateWelcomeScreen();
    }

    showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = `notification ${type}`;
        notification.classList.add('show');

        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new GitStashElectionApp();
});