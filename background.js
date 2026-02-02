// Background service worker for the extension
import { ProfileManager } from './utils/profiles.js';
import { GeminiAPI } from './utils/gemini.js';

class BackgroundService {
  constructor() {
    this.profileManager = new ProfileManager();
    this.gemini = new GeminiAPI();
    this.setupMessageHandlers();
    this.setupContextMenus();
  }

  setupMessageHandlers() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      this.handleMessage(request, sender, sendResponse);
      return true; // Keep message channel open for async response
    });
  }

  setupContextMenus() {
    chrome.runtime.onInstalled.addListener(() => {
      chrome.contextMenus.create({
        id: "autofill-form",
        title: "Smart Autofill",
        contexts: ["editable"]
      });
    });

    chrome.contextMenus.onClicked.addListener(async (info, tab) => {
      if (info.menuItemId === "autofill-form") {
        try {
          // Get the first available profile
          const profiles = await this.profileManager.getProfiles();
          if (profiles.length > 0) {
            // Inject content script if needed
            try {
              await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ['content.js']
              });
            } catch (error) {
              console.log('Content script already injected:', error);
            }

            // Send autofill message
            chrome.tabs.sendMessage(tab.id, {
              action: "autofillProfile",
              profile: profiles[0]
            });
          }
        } catch (error) {
          console.error('Context menu autofill failed:', error);
        }
      }
    });
  }

  async handleMessage(request, sender, sendResponse) {
    try {
      switch (request.action) {
        case 'saveProfile':
          await this.profileManager.saveProfile(request.profile);
          sendResponse({ success: true });
          break;

        case 'getProfiles':
          const profiles = await this.profileManager.getProfiles();
          sendResponse({ success: true, data: profiles });
          break;

        case 'deleteProfile':
          await this.profileManager.deleteProfile(request.profileId);
          sendResponse({ success: true });
          break;

        case 'getProfile':
          const profile = await this.profileManager.getProfile(request.profileId);
          sendResponse({ success: true, data: profile });
          break;

        case 'updateProfileUsage':
          await this.profileManager.updateProfileUsage(request.profileId);
          sendResponse({ success: true });
          break;

        case 'clearAllProfiles':
          await this.profileManager.clearAllProfiles();
          sendResponse({ success: true });
          break;

        case 'analyzeForm':
          // This is handled by content script now
          sendResponse({ success: false, error: 'Use content script for form analysis' });
          break;

        case 'aiMatchFields': {
          // AI-powered field mapping via secure proxy
          const { fields, profileData, domain } = request;
          try {
            const result = await this.gemini.analyzeFormFields(fields, profileData, domain);
            // Expect result like { suggestions: [{ fieldIndex, profileKey, confidence, reasoning }] }
            sendResponse({ success: true, data: result });
          } catch (e) {
            console.error('AI match failed:', e);
            sendResponse({ success: false, error: e.message });
          }
          break;
        }

        default:
          sendResponse({ success: false, error: 'Unknown action' });
      }
    } catch (error) {
      console.error('Background service error:', error);
      sendResponse({ success: false, error: error.message });
    }
  }
}

// Initialize background service
new BackgroundService();