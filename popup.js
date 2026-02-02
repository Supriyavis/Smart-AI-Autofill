// Popup JavaScript
class PopupManager {
  constructor() {
    this.profiles = [];
    this.selectedProfile = null;
    this.init();
  }

  async init() {
    this.setupEventHandlers();
    await this.loadData();
  }

  setupEventHandlers() {
    document.getElementById('settingsBtn').onclick = () => {
      chrome.runtime.openOptionsPage();
    };

    document.getElementById('createProfileBtn').onclick = () => {
      chrome.runtime.openOptionsPage();
    };

    document.getElementById('openOptionsBtn').onclick = () => {
      chrome.runtime.openOptionsPage();
    };

    document.getElementById('autofillBtn').onclick = async () => {
      await this.handleAutofillClick();
    };
  }

  async handleAutofillClick() {
    try {
      // If no profile selected, show profile selection
      if (!this.selectedProfile && this.profiles.length > 0) {
        this.showProfileSelection();
        return;
      }

      // If no profiles exist, redirect to create one
      if (this.profiles.length === 0) {
        chrome.runtime.openOptionsPage();
        return;
      }

      // Get active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab) {
        this.showNotification('No active tab found', 'error');
        return;
      }

      // Inject content script into ALL frames (supports iframes)
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id, allFrames: true },
          files: ['content.js']
        });
      } catch (error) {
        console.log('Content script injection (all frames) note:', error);
      }

      // Broadcast autofill message to ALL frames by executing a small script
      const profile = this.selectedProfile || this.profiles[0];
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id, allFrames: true },
        world: 'ISOLATED',
        func: (p) => {
          try {
            // Try direct call if the object exists in this frame
            if (window.smartAutofill && typeof window.smartAutofill.handleAutofillRequest === 'function') {
              return window.smartAutofill.handleAutofillRequest(p);
            }
            // Otherwise, request via runtime message which the content script listens for in this frame
            return new Promise((resolve) => {
              chrome.runtime.sendMessage({ action: 'autofillProfile', profile: p }, resolve);
            });
          } catch (e) {
            return { success: false, error: e.message };
          }
        },
        args: [profile]
      });

      // Aggregate results across frames
      let totalFilled = 0;
      let totalFields = 0;
      let anySuccess = false;
      for (const r of results) {
        const res = r?.result;
        if (res && res.success) {
          anySuccess = true;
          totalFilled += Number(res.fieldsCount || 0);
          totalFields = Math.max(totalFields, Number(res.totalFields || 0));
        }
      }
      const response = anySuccess ? { success: true, fieldsCount: totalFilled, totalFields } : { success: false };

      if (response && response.success) {
        // Increment fill count
        await this.incrementFillCount();
        this.showNotification(`Filled ${response.fieldsCount} fields successfully!`, 'success');
        
        // Update stats display
        this.updateStats();
        
        // Close popup after successful fill
        setTimeout(() => window.close(), 1500);
      } else {
        this.showNotification('No matching fields found on this page', 'warning');
      }

    } catch (error) {
      console.error('Autofill failed:', error);
      this.showNotification('Autofill failed. Please try again.', 'error');
    }
  }

  showProfileSelection() {
    const container = document.getElementById('profilesList');
    
    // Add selection mode styling
    container.innerHTML = `
      <div class="profile-selection-header">
        <h3>Select Profile to Use</h3>
        <p>Choose which profile to use for autofill</p>
      </div>
      ${this.profiles.map((profile, index) => `
        <div class="profile-item selectable" data-profile-id="${profile.id}" style="animation-delay: ${index * 0.1}s">
          <div class="profile-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <div class="profile-info">
            <h4>${profile.name}</h4>
            <p>${profile.type} • ${Object.keys(profile.data).length} fields</p>
          </div>
          <div class="profile-meta">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9,11 12,14 22,4"></polyline>
              <path d="m21,4-7.5,7.5L11,9"></path>
            </svg>
          </div>
        </div>
      `).join('')}
      <button class="btn btn-secondary btn-full" onclick="popupManager.cancelProfileSelection()">
        Cancel
      </button>
    `;

    // Add click handlers for profile selection
    container.querySelectorAll('.profile-item.selectable').forEach(item => {
      item.onclick = () => {
        const profileId = item.dataset.profileId;
        this.selectedProfile = this.profiles.find(p => p.id === profileId);
        this.handleAutofillClick();
      };
    });
  }

  cancelProfileSelection() {
    this.displayProfiles(this.profiles);
  }

  async loadData() {
    try {
      // Load profiles
      const response = await chrome.runtime.sendMessage({ action: 'getProfiles' });
      if (response && response.success) {
        this.profiles = response.data || [];
        this.displayProfiles(this.profiles);
        this.updateStats();
      } else {
        this.profiles = [];
        this.displayProfiles([]);
      }
    } catch (error) {
      console.error('Failed to load popup data:', error);
      this.showError();
    }
  }

  displayProfiles(profiles) {
    const container = document.getElementById('profilesList');
    
    if (profiles.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <h3>No Profiles Yet</h3>
          <p>Create your first profile to start using Smart Autofill</p>
        </div>
      `;
      return;
    }

    // Show recent profiles (max 5)
    const recentProfiles = profiles.slice(0, 5);
    
    container.innerHTML = recentProfiles.map((profile, index) => `
      <div class="profile-item" data-profile-id="${profile.id}" style="animation-delay: ${index * 0.1}s">
        <div class="profile-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
        <div class="profile-info">
          <h4>${profile.name}</h4>
          <p>${profile.type} • ${Object.keys(profile.data).length} fields</p>
        </div>
        <div class="profile-meta">
          ${this.formatDate(profile.lastUsed || profile.created)}
        </div>
      </div>
    `).join('');

    // Add click handlers for profile preview
    container.querySelectorAll('.profile-item').forEach(item => {
      item.onclick = () => {
        const profileId = item.dataset.profileId;
        this.selectedProfile = this.profiles.find(p => p.id === profileId);
        
        // Visual feedback for selection
        container.querySelectorAll('.profile-item').forEach(p => p.classList.remove('selected'));
        item.classList.add('selected');
        
        // Update autofill button text
        const autofillBtn = document.getElementById('autofillBtn');
        autofillBtn.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 12l2 2 4-4"></path>
            <circle cx="12" cy="12" r="10"></circle>
          </svg>
          Fill with ${this.selectedProfile.name}
        `;
      };
    });
  }

  async updateStats() {
    try {
      document.getElementById('profileCount').textContent = this.profiles.length;
      
      // Get fill count from storage
      const result = await chrome.storage.local.get(['fillCount']);
      document.getElementById('fillCount').textContent = result.fillCount || 0;
    } catch (error) {
      console.error('Failed to update stats:', error);
    }
  }

  async incrementFillCount() {
    try {
      const result = await chrome.storage.local.get(['fillCount']);
      const newCount = (result.fillCount || 0) + 1;
      await chrome.storage.local.set({ fillCount: newCount });
    } catch (error) {
      console.error('Failed to increment fill count:', error);
    }
  }

  formatDate(dateString) {
    if (!dateString) return 'New';
    
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return date.toLocaleDateString();
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      z-index: 10000;
      background: ${type === 'success' ? '#4b5563' : type === 'error' ? '#6b7280' : '#9ca3af'};
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 500;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
      transform: translateX(100%);
      transition: transform 0.3s ease;
      max-width: 250px;
      word-wrap: break-word;
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    requestAnimationFrame(() => {
      notification.style.transform = 'translateX(0)';
    });
    
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  showError() {
    const container = document.getElementById('profilesList');
    container.innerHTML = `
      <div class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
        <h3>Error Loading Data</h3>
        <p>Please try again or check your settings</p>
      </div>
    `;
  }
}

// Initialize popup when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.popupManager = new PopupManager();
});