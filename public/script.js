class GitStashElection {
    constructor() {
        this.selectedStash = null;
        this.stashes = [];
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadStashes();
        this.loadStatus();
    }

    bindEvents() {
        document.getElementById('refresh-btn').addEventListener('click', () => {
            this.loadStashes();
            this.loadStatus();
        });

        document.getElementById('apply-btn').addEventListener('click', () => {
            if (this.selectedStash !== null) {
                this.applyStash(this.selectedStash);
            }
        });

        document.getElementById('drop-btn').addEventListener('click', () => {
            if (this.selectedStash !== null) {
                this.dropStash(this.selectedStash);
            }
        });
    }

    async loadStashes() {
        try {
            const response = await fetch('/api/stashes');
            const data = await response.json();
            this.stashes = data.all || [];
            this.renderStashes();
        } catch (error) {
            console.error('Error loading stashes:', error);
            this.showNotification('Failed to load stashes', 'error');
        }
    }

    async loadStatus() {
        try {
            const response = await fetch('/api/status');
            const status = await response.json();
            this.renderStatus(status);
        } catch (error) {
            console.error('Error loading status:', error);
            this.renderStatus({ error: 'Failed to load repository status' });
        }
    }

    renderStatus(status) {
        const statusEl = document.getElementById('repo-status');
        
        if (status.error) {
            statusEl.textContent = status.error;
            return;
        }

        const statusText = `
Branch: ${status.current || 'unknown'}
Staged files: ${status.staged?.length || 0}
Modified files: ${status.modified?.length || 0}
Untracked files: ${status.not_added?.length || 0}
Deleted files: ${status.deleted?.length || 0}

Working directory: ${status.isClean() ? 'Clean ✅' : 'Has changes ⚠️'}
        `.trim();
        
        statusEl.textContent = statusText;
    }

    renderStashes() {
        const stashListEl = document.getElementById('stash-list');
        
        if (this.stashes.length === 0) {
            stashListEl.innerHTML = `
                <div class="empty-state">
                    No stashes found. Create some stashes with "git stash" to see them here!
                </div>
            `;
            return;
        }

        stashListEl.innerHTML = this.stashes.map((stash, index) => `
            <div class="stash-card" data-index="${index}">
                <div class="stash-header">
                    <span class="stash-index">Stash #${index}</span>
                    <span class="stash-hash">${stash.hash?.substring(0, 8) || 'unknown'}</span>
                </div>
                <div class="stash-message">${stash.message || 'No message'}</div>
                <div class="stash-date">${stash.date || 'Unknown date'}</div>
            </div>
        `).join('');

        // Add click events to stash cards
        stashListEl.querySelectorAll('.stash-card').forEach(card => {
            card.addEventListener('click', () => {
                const index = parseInt(card.dataset.index);
                this.selectStash(index);
            });
        });
    }

    async selectStash(index) {
        // Update visual selection
        document.querySelectorAll('.stash-card').forEach(card => {
            card.classList.remove('selected');
        });
        document.querySelector(`[data-index="${index}"]`).classList.add('selected');

        this.selectedStash = index;
        
        // Enable action buttons
        document.getElementById('apply-btn').disabled = false;
        document.getElementById('drop-btn').disabled = false;

        // Load stash details
        try {
            const response = await fetch(`/api/stash/${index}`);
            const data = await response.json();
            this.renderStashDetails(data.content);
        } catch (error) {
            console.error('Error loading stash details:', error);
            this.renderStashDetails('Failed to load stash content');
        }
    }

    renderStashDetails(content) {
        const detailsEl = document.getElementById('stash-details');
        detailsEl.textContent = content || 'No content available';
    }

    async applyStash(index) {
        if (!confirm(`Are you sure you want to apply stash@{${index}}?`)) {
            return;
        }

        try {
            const response = await fetch(`/api/stash/${index}/apply`, {
                method: 'POST'
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.showNotification(data.message, 'success');
                this.loadStatus(); // Refresh status after applying
            } else {
                this.showNotification(data.error || 'Failed to apply stash', 'error');
            }
        } catch (error) {
            console.error('Error applying stash:', error);
            this.showNotification('Failed to apply stash', 'error');
        }
    }

    async dropStash(index) {
        if (!confirm(`Are you sure you want to permanently delete stash@{${index}}? This action cannot be undone!`)) {
            return;
        }

        try {
            const response = await fetch(`/api/stash/${index}/drop`, {
                method: 'POST'
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.showNotification(data.message, 'success');
                this.selectedStash = null;
                document.getElementById('apply-btn').disabled = true;
                document.getElementById('drop-btn').disabled = true;
                document.getElementById('stash-details').textContent = 'Select a stash to view its contents';
                this.loadStashes(); // Refresh the list
            } else {
                this.showNotification(data.error || 'Failed to drop stash', 'error');
            }
        } catch (error) {
            console.error('Error dropping stash:', error);
            this.showNotification('Failed to drop stash', 'error');
        }
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

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new GitStashElection();
});