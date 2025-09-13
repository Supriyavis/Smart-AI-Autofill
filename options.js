// Options page JavaScript
class OptionsManager {
  constructor() {
    this.currentSection = 'personal';
    this.currentTab = 'profiles';
    this.profiles = [];
    this.editingProfile = null;
    this.init();
  }

  async init() {
    this.setupEventHandlers();
    this.setupTabNavigation();
    await this.loadProfiles();
    this.loadSettings();
  }

  setupEventHandlers() {
    // Profile management
    document.getElementById('createNewProfile').onclick = () => this.openProfileModal();
    document.getElementById('closeModal').onclick = () => this.closeProfileModal();
    document.getElementById('profileForm').onsubmit = (e) => this.saveProfile(e);

    // Navigation
    document.getElementById('nextSection').onclick = () => this.nextSection();
    document.getElementById('prevSection').onclick = () => this.prevSection();

    // Settings
    document.getElementById('confidenceThreshold').oninput = (e) => this.updateRangeValue(e);
    document.getElementById('clearAllData').onclick = () => this.clearAllData();

    // Form navigation dots
    document.querySelectorAll('.nav-dot').forEach(dot => {
      dot.onclick = () => this.goToSection(dot.dataset.section);
    });

    // Modal overlay close
    document.getElementById('profileModal').onclick = (e) => {
      if (e.target === e.currentTarget) this.closeProfileModal();
    };

    // Settings change handlers
    this.setupSettingsHandlers();
  }

  setupTabNavigation() {
    document.querySelectorAll('.nav-item').forEach(item => {
      item.onclick = (e) => {
        e.preventDefault();
        const tab = item.dataset.tab;
        this.switchTab(tab);
      };
    });
  }

  switchTab(tab) {
    // Update navigation
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');

    // Update content
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.remove('active');
    });
    document.getElementById(tab).classList.add('active');

    this.currentTab = tab;
  }

  async loadProfiles() {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'getProfiles' });
      if (response.success) {
        this.profiles = response.data;
        this.displayProfiles();
      }
    } catch (error) {
      console.error('Failed to load profiles:', error);
      this.showError('Failed to load profiles');
    }
  }

  displayProfiles() {
    const container = document.getElementById('profilesGrid');
    
    if (this.profiles.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <h3>No Profiles Created</h3>
          <p>Create your first profile to start using Smart Autofill.<br>You can create separate profiles for work, personal use, and education.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = this.profiles.map(profile => `
      <div class="profile-card">
        <div class="profile-header">
          <div class="profile-info">
            <h3>${profile.name}</h3>
            <div class="profile-type">${profile.type}</div>
          </div>
        </div>
        
        <div class="profile-stats">
          <div class="stat-item">
            <div class="value">${Object.keys(profile.data).length}</div>
            <div class="label">Fields</div>
          </div>
          <div class="stat-item">
            <div class="value">${profile.usageCount || 0}</div>
            <div class="label">Uses</div>
          </div>
        </div>
        
        <div class="profile-actions">
          <button class="btn btn-sm btn-secondary" onclick="optionsManager.editProfile('${profile.id}')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            Edit
          </button>
          <button class="btn btn-sm btn-danger" onclick="optionsManager.deleteProfile('${profile.id}')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3,6 5,6 21,6"></polyline>
              <path d="m19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1 2-2h4a2,2 0 0,1 2,2v2"></path>
            </svg>
            Delete
          </button>
        </div>
      </div>
    `).join('');
  }

  openProfileModal(profile = null) {
    this.editingProfile = profile;
    const modal = document.getElementById('profileModal');
    const title = document.getElementById('modalTitle');
    
    if (profile) {
      title.textContent = 'Edit Profile';
      this.populateForm(profile);
    } else {
      title.textContent = 'Create New Profile';
      this.resetForm();
    }
    
    modal.classList.add('active');
    this.goToSection('personal');
  }

  closeProfileModal() {
    document.getElementById('profileModal').classList.remove('active');
    this.editingProfile = null;
    this.resetForm();
  }

  resetForm() {
    document.getElementById('profileForm').reset();
    this.currentSection = 'personal';
    this.updateNavigation();
  }

  populateForm(profile) {
    // Populate form fields with profile data
    Object.keys(profile.data).forEach(key => {
      const field = document.getElementById(key);
      if (field) {
        field.value = profile.data[key];
      }
    });
    
    document.getElementById('profileName').value = profile.name;
    document.getElementById('profileType').value = profile.type;
  }

  async saveProfile(e) {
    e.preventDefault();
    
    try {
      const formData = new FormData(e.target);
      const profileData = {};
      
      // Collect all form data
      const fields = [
        'firstName', 'lastName', 'email', 'phone', 'dateOfBirth', 'gender',
        'street', 'city', 'state', 'zipCode', 'country',
        'jobTitle', 'company', 'workStartDate', 'workEndDate', 'workDescription',
        'degree', 'institution', 'eduStartDate', 'eduEndDate', 'gpa',
        'skills', 'interests', 'languages'
      ];
      
      fields.forEach(field => {
        const element = document.getElementById(field);
        if (element && element.value) {
          profileData[field] = element.value;
        }
      });

      const profile = {
        id: this.editingProfile?.id || `profile_${Date.now()}`,
        name: document.getElementById('profileName').value,
        type: document.getElementById('profileType').value,
        data: profileData,
        created: this.editingProfile?.created || new Date().toISOString(),
        lastModified: new Date().toISOString()
      };

      const response = await chrome.runtime.sendMessage({ 
        action: 'saveProfile', 
        profile: profile 
      });

      if (response.success) {
        this.closeProfileModal();
        await this.loadProfiles();
        this.showNotification('Profile saved successfully!', 'success');
      } else {
        throw new Error(response.error || 'Failed to save profile');
      }
      
    } catch (error) {
      console.error('Failed to save profile:', error);
      this.showNotification('Failed to save profile', 'error');
    }
  }

  async editProfile(profileId) {
    const profile = this.profiles.find(p => p.id === profileId);
    if (profile) {
      this.openProfileModal(profile);
    }
  }

  async deleteProfile(profileId) {
    if (confirm('Are you sure you want to delete this profile? This action cannot be undone.')) {
      try {
        const response = await chrome.runtime.sendMessage({ 
          action: 'deleteProfile', 
          profileId: profileId 
        });
        
        if (response.success) {
          await this.loadProfiles();
          this.showNotification('Profile deleted successfully', 'success');
        } else {
          throw new Error(response.error || 'Failed to delete profile');
        }
      } catch (error) {
        console.error('Failed to delete profile:', error);
        this.showNotification('Failed to delete profile', 'error');
      }
    }
  }

  // Navigation methods
  nextSection() {
    const sections = ['personal', 'address', 'work', 'education', 'skills'];
    const currentIndex = sections.indexOf(this.currentSection);
    
    if (currentIndex < sections.length - 1) {
      this.goToSection(sections[currentIndex + 1]);
    }
  }

  prevSection() {
    const sections = ['personal', 'address', 'work', 'education', 'skills'];
    const currentIndex = sections.indexOf(this.currentSection);
    
    if (currentIndex > 0) {
      this.goToSection(sections[currentIndex - 1]);
    }
  }

  goToSection(section) {
    // Hide current section
    document.querySelector('.form-section.active')?.classList.remove('active');
    
    // Show target section
    document.querySelector(`[data-section="${section}"]`).classList.add('active');
    
    this.currentSection = section;
    this.updateNavigation();
  }

  updateNavigation() {
    const sections = ['personal', 'address', 'work', 'education', 'skills'];
    const currentIndex = sections.indexOf(this.currentSection);
    
    // Update dots
    document.querySelectorAll('.nav-dot').forEach((dot, index) => {
      dot.classList.toggle('active', index === currentIndex);
    });
    
    // Update buttons
    document.getElementById('prevSection').disabled = currentIndex === 0;
    document.getElementById('nextSection').style.display = currentIndex === sections.length - 1 ? 'none' : 'inline-flex';
    document.getElementById('submitProfile').style.display = currentIndex === sections.length - 1 ? 'inline-flex' : 'none';
  }

  // Settings methods
  setupSettingsHandlers() {
    const settings = [
      'confidenceThreshold', 'enableAIResponse', 'showPreview', 
      'enableAnimation', 'requireConfirmation', 'autoClearPeriod', 'themeSelect'
    ];
    
    settings.forEach(settingId => {
      const element = document.getElementById(settingId);
      if (element) {
        element.onchange = () => this.saveSetting(settingId, element.value || element.checked);
      }
    });
  }

  loadSettings() {
    chrome.storage.local.get([
      'confidenceThreshold', 'enableAIResponse', 'showPreview',
      'enableAnimation', 'requireConfirmation', 'autoClearPeriod', 'theme'
    ], (settings) => {
      // Set default values and update UI
      document.getElementById('confidenceThreshold').value = settings.confidenceThreshold || 0.8;
      document.getElementById('enableAIResponse').checked = settings.enableAIResponse !== false;
      document.getElementById('showPreview').checked = settings.showPreview !== false;
      document.getElementById('enableAnimation').checked = settings.enableAnimation !== false;
      document.getElementById('requireConfirmation').checked = settings.requireConfirmation || false;
      document.getElementById('autoClearPeriod').value = settings.autoClearPeriod || 'never';
      document.getElementById('themeSelect').value = settings.theme || 'system';
      
      this.updateRangeValue({ target: document.getElementById('confidenceThreshold') });
    });
  }

  saveSetting(key, value) {
    chrome.storage.local.set({ [key]: value });
    
    if (key === 'theme') {
      this.applyTheme(value);
    }
  }

  updateRangeValue(e) {
    const value = Math.round(e.target.value * 100);
    e.target.parentElement.querySelector('.range-value').textContent = `${value}%`;
  }

  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
  }

  async clearAllData() {
    if (confirm('Are you sure you want to delete ALL profiles and data? This action cannot be undone.')) {
      if (confirm('This will permanently delete all your profiles, settings, and usage data. Continue?')) {
        try {
          const response = await chrome.runtime.sendMessage({ action: 'clearAllProfiles' });
          if (response.success) {
            this.profiles = [];
            this.displayProfiles();
            this.loadSettings();
            this.showNotification('All data cleared successfully', 'success');
          } else {
            throw new Error(response.error || 'Failed to clear data');
          }
        } catch (error) {
          console.error('Failed to clear data:', error);
          this.showNotification('Failed to clear data', 'error');
        }
      }
    }
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#6b7280'};
      color: white;
      padding: 16px 24px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
      transform: translateX(100%);
      transition: transform 0.3s ease;
      max-width: 400px;
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    requestAnimationFrame(() => {
      notification.style.transform = 'translateX(0)';
    });
    
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => notification.remove(), 300);
    }, 4000);
  }

  showError(message) {
    this.showNotification(message, 'error');
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.optionsManager = new OptionsManager();
});