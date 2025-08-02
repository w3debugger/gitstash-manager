class GitStashElectionApp {
    constructor() {
        this.selectedRepository = null;
        this.selectedStash = null;
        this.selectedFile = null;
        this.repositories = [];
        this.stashes = [];
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
        
        document.getElementById('add-first-repo').addEventListener('click', () => {
            this.addRepository();
        });
        
        document.getElementById('welcome-add-repo').addEventListener('click', () => {
            this.addRepository();
        });

        // Refresh functionality
        document.getElementById('refresh-btn').addEventListener('click', () => {
            this.refreshCurrentRepository();
        });

        document.getElementById('refresh-stashes-btn').addEventListener('click', () => {
            this.refreshCurrentRepository();
        });

        // Stash actions are now handled inline with each stash item
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
        const repositoriesList = document.getElementById('repositories-list');
        
        if (this.repositories.length === 0) {
            repositoriesList.innerHTML = `
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

        repositoriesList.innerHTML = this.repositories.map(repo => `
            <div class="repository-item" data-repo-id="${repo.id}" data-repo-path="${repo.path}">
                <div class="repo-name">
                    📂 ${repo.name}
                </div>
                <div class="repo-path">${repo.path}</div>
                <button class="repo-remove" data-repo-id="${repo.id}" title="Remove Repository">✕</button>
            </div>
        `).join('');

        // Add event listeners to repository items
        repositoriesList.querySelectorAll('.repository-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.classList.contains('repo-remove')) {
                    const repoId = item.dataset.repoId;
                    const repoPath = item.dataset.repoPath;
                    const repo = this.repositories.find(r => r.id === repoId);
                    this.selectRepository(repo);
                }
            });
        });

        // Add event listeners to remove buttons
        repositoriesList.querySelectorAll('.repo-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const repoId = btn.dataset.repoId;
                this.removeRepository(repoId);
            });
        });
    }

    updateWelcomeScreen() {
        console.log('updateWelcomeScreen called');
        console.log('repositories.length:', this.repositories.length);
        console.log('selectedRepository:', this.selectedRepository);
        
        const welcomeScreen = document.getElementById('welcome-screen');
        const repoHeader = document.getElementById('repo-header');
        const stashDetailsView = document.getElementById('stash-details-view');
        const sidebarStashesSection = document.getElementById('sidebar-stashes-section');
        const filesSidebar = document.getElementById('files-sidebar');
        
        console.log('DOM elements found:');
        console.log('welcomeScreen:', !!welcomeScreen);
        console.log('repoHeader:', !!repoHeader);
        console.log('stashDetailsView:', !!stashDetailsView);
        console.log('sidebarStashesSection:', !!sidebarStashesSection);
        console.log('filesSidebar:', !!filesSidebar);
        
        if (this.repositories.length === 0) {
            console.log('No repositories, hiding everything');
            welcomeScreen.style.display = 'flex';
            repoHeader.style.display = 'none';
            stashDetailsView.style.display = 'none';
            sidebarStashesSection.style.display = 'none';
            filesSidebar.style.display = 'none';
        } else {
            console.log('Repositories exist, checking selected repository');
            welcomeScreen.style.display = 'none';
            if (this.selectedRepository) {
                console.log('Repository selected, showing all UI elements');
                repoHeader.style.display = 'flex';
                stashDetailsView.style.display = 'flex';
                sidebarStashesSection.style.display = 'flex';
                filesSidebar.style.display = 'flex';
                console.log('filesSidebar display set to:', filesSidebar.style.display);
            } else {
                console.log('No repository selected, hiding UI elements');
                repoHeader.style.display = 'none';
                stashDetailsView.style.display = 'none';
                sidebarStashesSection.style.display = 'none';
                filesSidebar.style.display = 'none';
            }
        }
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
        // Update visual selection
        document.querySelectorAll('.repository-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-repo-id="${repository.id}"]`).classList.add('active');

        this.selectedRepository = repository;
        this.selectedStash = null;

        // Update header
        document.getElementById('current-repo-name').textContent = repository.name;
        document.getElementById('current-repo-path').textContent = repository.path;

        // Show main panels
        this.updateWelcomeScreen();

        // Load repository data
        await this.loadRepositoryData();
    }

    async loadRepositoryData() {
        if (!this.selectedRepository) return;

        // Load stashes and status in parallel
        await Promise.all([
            this.loadStashes(),
            this.loadRepositoryStatus()
        ]);
    }

    async loadStashes() {
        if (!this.selectedRepository) return;

        try {
            const result = await window.electronAPI.getStashes(this.selectedRepository.path);
            
            if (result.success) {
                this.stashes = result.stashes;
                this.renderStashes();
                
                // Auto-select first stash if available
                if (this.stashes.length > 0 && this.selectedStash === null) {
                    await this.selectStash(0);
                }
            } else {
                this.showNotification(`Failed to load stashes: ${result.error}`, 'error');
                this.stashes = [];
                this.renderStashes();
            }
        } catch (error) {
            console.error('Error loading stashes:', error);
            this.showNotification('Failed to load stashes', 'error');
        }
    }

    async loadRepositoryStatus() {
        if (!this.selectedRepository) return;

        try {
            const result = await window.electronAPI.getRepoStatus(this.selectedRepository.path);
            
            if (result.success) {
                this.renderRepositoryStatus(result.status);
            } else {
                this.renderRepositoryStatus({ error: result.error });
            }
        } catch (error) {
            console.error('Error loading repository status:', error);
            this.renderRepositoryStatus({ error: 'Failed to load repository status' });
        }
    }

    renderRepositoryStatus(status) {
        const statusEl = document.getElementById('repo-status');
        
        if (status.error) {
            statusEl.textContent = status.error;
            return;
        }

        const statusText = `
Branch: ${status.current || 'unknown'}
Staged files: ${status.stagedCount || 0}
Modified files: ${status.modifiedCount || 0}
Untracked files: ${status.untrackedCount || 0}
Deleted files: ${status.deletedCount || 0}
Total changes: ${status.totalChanges || 0}

Working directory: ${status.isClean ? 'Clean ✅' : 'Has changes ⚠️'}
        `.trim();
        
        statusEl.textContent = statusText;
    }

    renderStashes() {
        const sidebarStashListEl = document.getElementById('sidebar-stash-list');
        
        if (this.stashes.length === 0) {
            sidebarStashListEl.innerHTML = `
                <div class="empty-stashes">
                    No stashes found. Create some stashes with "git stash" to see them here!
                </div>
            `;
            return;
        }

        sidebarStashListEl.innerHTML = this.stashes.map((stash, index) => `
            <div class="sidebar-stash-item" data-index="${index}">
                <div class="stash-content">
                    <div class="stash-sidebar-header">
                        <span class="stash-sidebar-index">#${index}</span>
                        <span class="stash-sidebar-hash">${stash.hash?.substring(0, 7) || 'unknown'}</span>
                    </div>
                    <div class="stash-sidebar-message">${stash.message || 'No message'}</div>
                    <div class="stash-sidebar-date">${stash.date || 'Unknown date'}</div>
                </div>
                <div class="stash-actions">
                    <button class="stash-action-btn apply" data-index="${index}" title="Apply Stash">
                        ✅
                    </button>
                    <button class="stash-action-btn drop" data-index="${index}" title="Drop Stash">
                        🗑️
                    </button>
                </div>
            </div>
        `).join('');

        // Add click events to sidebar stash items and buttons
        sidebarStashListEl.querySelectorAll('.sidebar-stash-item').forEach(item => {
            // Click event for selecting stash (whole item except buttons)
            item.addEventListener('click', (e) => {
                // Don't trigger if clicking on buttons
                if (e.target.classList.contains('stash-action-btn')) {
                    return;
                }
                
                const index = parseInt(item.dataset.index);
                console.log('🔍 Stash item clicked:', index);
                this.selectStash(index);
            });
        });

        // Auto-select first stash if available and none is selected
        if (this.stashes.length > 0 && this.selectedStash === null) {
            console.log('🚀 Auto-selecting first stash');
            this.selectStash(0);
        }

        // Add click events for apply/drop buttons
        sidebarStashListEl.querySelectorAll('.stash-action-btn.apply').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const index = parseInt(btn.dataset.index);
                this.applyStash(index);
            });
        });

        sidebarStashListEl.querySelectorAll('.stash-action-btn.drop').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const index = parseInt(btn.dataset.index);
                this.dropStash(index);
            });
        });
    }

    async selectStash(index) {
        console.log('🎯 selectStash called with index:', index);
        
        if (!this.selectedRepository) {
            console.log('❌ No repository selected');
            return;
        }

        if (!this.stashes[index]) {
            console.log('❌ No stash at index:', index);
            return;
        }

        console.log('✅ Selecting stash:', index);

        // Update visual selection in sidebar
        document.querySelectorAll('.sidebar-stash-item').forEach(item => {
            item.classList.remove('selected');
        });
        const selectedItem = document.querySelector(`[data-index="${index}"]`);
        if (selectedItem) {
            selectedItem.classList.add('selected');
            console.log('✅ Visual selection updated');
        }

        this.selectedStash = index;
        this.selectedFile = null; // Reset file selection
        
        // Update the stash details content
        const stashDetails = document.getElementById('stash-details');
        if (stashDetails) {
            stashDetails.textContent = 'Loading stash content...';
        } else {
            console.error('❌ stash-details element not found!');
        }
        
        // Load files for this stash
        console.log('🔄 Loading stash files...');
        await this.loadStashFiles();
    }

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

    async applyStash(index) {
        if (!this.selectedRepository) return;

        const confirmed = confirm(`Are you sure you want to apply stash@{${index}}?`);
        if (!confirmed) return;

        try {
            const result = await window.electronAPI.applyStash(this.selectedRepository.path, index);
            
            if (result.success) {
                this.showNotification(result.message, 'success');
                this.loadRepositoryStatus(); // Refresh status after applying
            } else {
                this.showNotification(result.error || 'Failed to apply stash', 'error');
            }
        } catch (error) {
            console.error('Error applying stash:', error);
            this.showNotification('Failed to apply stash', 'error');
        }
    }

    async dropStash(index) {
        if (!this.selectedRepository) return;

        const confirmed = confirm(`Are you sure you want to permanently delete stash@{${index}}? This action cannot be undone!`);
        if (!confirmed) return;

        try {
            const result = await window.electronAPI.dropStash(this.selectedRepository.path, index);
            
            if (result.success) {
                this.showNotification(result.message, 'success');
                this.selectedStash = null;
                this.selectedFile = null;
                document.getElementById('apply-btn').disabled = true;
                document.getElementById('drop-btn').disabled = true;
                document.getElementById('stash-details').textContent = '👈 Select a stash from the sidebar to view its changes';
                document.getElementById('selected-stash-title').textContent = 'Select a Stash Candidate';
                document.getElementById('files-list').innerHTML = '<div class="loading-files">Select a stash to view files</div>';
                document.getElementById('files-count').textContent = '0 files';
                this.loadStashes(); // Refresh the list
            } else {
                this.showNotification(result.error || 'Failed to drop stash', 'error');
            }
        } catch (error) {
            console.error('Error dropping stash:', error);
            this.showNotification('Failed to drop stash', 'error');
        }
    }

    async refreshCurrentRepository() {
        if (this.selectedRepository) {
            this.showNotification('Refreshing...', 'info');
            await this.loadRepositoryData();
            this.showNotification('Repository refreshed!', 'success');
        }
    }

    clearSelection() {
        // Clear repository header
        document.getElementById('current-repo-name').textContent = 'Select a Repository';
        document.getElementById('current-repo-path').textContent = 'Choose a repository from the sidebar to view its stashes';
        
        // Clear stash selection
        this.selectedStash = null;
        this.selectedFile = null;
        // Buttons are now inline with stash items
        document.getElementById('stash-details').textContent = '👈 Select a stash from the sidebar to view its changes';
        document.getElementById('selected-stash-title').textContent = 'Select a Stash Candidate';
        
        // Clear sidebar stash list
        document.getElementById('sidebar-stash-list').innerHTML = '<div class="loading-stashes">Select a repository to view stashes</div>';
        
        // Clear files list
        document.getElementById('files-list').innerHTML = '<div class="loading-files">Select a stash to view files</div>';
        document.getElementById('files-count').textContent = '0 files';
        
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