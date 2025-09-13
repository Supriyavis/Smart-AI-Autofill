// Profile management utilities
export class ProfileManager {
  constructor() {
    this.storageKey = 'smart_autofill_profiles';
  }

  async saveProfile(profile) {
    try {
      const profiles = await this.getProfiles();
      const existingIndex = profiles.findIndex(p => p.id === profile.id);
      
      // Add timestamps
      const profileWithTimestamp = {
        ...profile,
        created: profile.created || new Date().toISOString(),
        lastModified: new Date().toISOString(),
        usageCount: profile.usageCount || 0
      };
      
      if (existingIndex >= 0) {
        profiles[existingIndex] = profileWithTimestamp;
      } else {
        profiles.push(profileWithTimestamp);
      }

      await this.saveProfiles(profiles);
      return true;
    } catch (error) {
      console.error('Failed to save profile:', error);
      throw new Error('Failed to save profile');
    }
  }

  async getProfiles() {
    try {
      const result = await new Promise(resolve => {
        chrome.storage.local.get([this.storageKey], resolve);
      });
      
      const profiles = result[this.storageKey] || [];
      return profiles.sort((a, b) => new Date(b.lastModified || b.created) - new Date(a.lastModified || a.created));
    } catch (error) {
      console.error('Failed to load profiles:', error);
      return [];
    }
  }

  async deleteProfile(profileId) {
    try {
      const profiles = await this.getProfiles();
      const filteredProfiles = profiles.filter(p => p.id !== profileId);
      await this.saveProfiles(filteredProfiles);
      return true;
    } catch (error) {
      console.error('Failed to delete profile:', error);
      throw new Error('Failed to delete profile');
    }
  }

  async getProfile(profileId) {
    const profiles = await this.getProfiles();
    return profiles.find(p => p.id === profileId);
  }

  async updateProfileUsage(profileId) {
    try {
      const profiles = await this.getProfiles();
      const profile = profiles.find(p => p.id === profileId);
      
      if (profile) {
        profile.lastUsed = new Date().toISOString();
        profile.usageCount = (profile.usageCount || 0) + 1;
        await this.saveProfile(profile);
      }
    } catch (error) {
      console.error('Failed to update profile usage:', error);
    }
  }

  async saveProfiles(profiles) {
    return new Promise(resolve => {
      chrome.storage.local.set({
        [this.storageKey]: profiles
      }, resolve);
    });
  }

  async clearAllProfiles() {
    try {
      await new Promise(resolve => {
        chrome.storage.local.remove([this.storageKey], resolve);
      });
      return true;
    } catch (error) {
      console.error('Failed to clear profiles:', error);
      throw error;
    }
  }

  validateProfileData(profile) {
    const requiredFields = ['id', 'name', 'type', 'data'];
    const missingFields = requiredFields.filter(field => !profile[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    if (typeof profile.data !== 'object') {
      throw new Error('Profile data must be an object');
    }

    return true;
  }

  async exportProfiles() {
    try {
      const profiles = await this.getProfiles();
      const exportData = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        profiles: profiles
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Failed to export profiles:', error);
      throw error;
    }
  }

  async importProfiles(importData) {
    try {
      const data = JSON.parse(importData);
      
      if (!data.profiles || !Array.isArray(data.profiles)) {
        throw new Error('Invalid import data format');
      }

      const existingProfiles = await this.getProfiles();
      let importedCount = 0;

      for (const importProfile of data.profiles) {
        const existingProfile = existingProfiles.find(p => 
          p.id === importProfile.id || 
          (p.name === importProfile.name && p.type === importProfile.type)
        );

        if (!existingProfile) {
          importProfile.id = `imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          importProfile.created = new Date().toISOString();
          
          await this.saveProfile(importProfile);
          importedCount++;
        }
      }

      return importedCount;
    } catch (error) {
      console.error('Failed to import profiles:', error);
      throw error;
    }
  }
}