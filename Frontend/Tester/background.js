// Check if we're in a service worker context
const isServiceWorker = typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getManifest;

// Show error notification
async function showErrorNotification(errorCount) {
  if (!chrome?.notifications?.create) return;

  try {
    // Show system notification only for errors
    await chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: 'Code Issues Detected',
      message: `Found ${errorCount} issue${errorCount > 1 ? 's' : ''}`,
      priority: 2,
      requireInteraction: true
    });

    // Update badge for errors
    if (chrome.action?.setBadgeText) {
      await chrome.action.setBadgeText({ text: String(errorCount) });
      await chrome.action.setBadgeBackgroundColor({ color: "#FF0000" });
    }
  } catch (error) {
    console.error('Error in showErrorNotification:', error);
  }
}

// Add popup initialization
function initializePopup(tab) {
    chrome.scripting.insertCSS({
        target: { tabId: tab.id },
        css: `
            .extension-popup {
                position: fixed;
                right: 20px;
                top: 20px;
                background: rgba(83, 131, 146, 0.95);
                color: white;
                padding: 15px 25px;
                border-radius: 8px;
                font-family: Arial, sans-serif;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
                z-index: 10000;
                animation: popupBounce 1s ease-out;
                cursor: pointer;
                transition: all 0.3s ease;
            }

            .extension-popup:hover {
                transform: scale(1.05);
                background: rgba(83, 131, 146, 1);
            }

            .extension-popup::before {
                content: '👆';
                margin-right: 8px;
            }

            @keyframes popupBounce {
                0% { transform: scale(0); opacity: 0; }
                50% { transform: scale(1.1); }
                70% { transform: scale(0.95); }
                100% { transform: scale(1); opacity: 1; }
            }
        `
    });

    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: showPopupMessage
    });
}

// Function to show popup message
function showPopupMessage() {
    if (!document.querySelector('.extension-popup')) {
        const popup = document.createElement('div');
        popup.className = 'extension-popup';
        popup.textContent = 'Click me to analyze page!';
        
        // Add click handler
        popup.addEventListener('click', () => {
            popup.style.animation = 'popupBounce 0.5s ease-out reverse';
            setTimeout(() => {
                popup.remove();
                // Trigger extension action
                chrome.runtime.sendMessage({ action: 'activateExtension' });
            }, 400);
        });

        document.body.appendChild(popup);
    }
}

// Modified icon click handler
chrome.action.onClicked.addListener((tab) => {
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content1.js']
    });
});

// Add tab update listener to show popup on page load
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url?.startsWith('http')) {
        initializePopup(tab);
    }
});

// Add new message handler for extension activation
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    try {
        switch (message.action) {
            case "errorsFound":
                if (message.errorCount) {
                    showErrorNotification(message.errorCount);
                }
                break;

            case "noErrors":
                // Just clear the badge, no notification
                if (chrome.action?.setBadgeText) {
                    chrome.action.setBadgeText({ text: "" });
                }
                break;

            case "openStackOverflow":
                if (chrome.tabs?.create) {
                    const url = `https://stackoverflow.com/search?q=${encodeURIComponent(message.query || '')}`;
                    chrome.tabs.create({ url });
                }
                break;

            case "activateExtension":
                chrome.scripting.executeScript({
                    target: { tabId: sender.tab.id },
                    files: ['content1.js']
                });
                break;
        }
    } catch (error) {
        logError(error);
    }
});

// Error tracking
const errorLog = [];

function logError(error) {
  const entry = {
    timestamp: new Date().toISOString(),
    error: error?.message || String(error),
    stack: error?.stack
  };
  
  errorLog.push(entry);
  if (errorLog.length > 100) errorLog.shift();
  
  console.error('Extension Error:', entry);
}

// Error listener setup
if (chrome?.runtime?.onError) {
  chrome.runtime.onError.addListener((error) => {
    logError(error);
  });
}

// Export for service worker
if (isServiceWorker) {
  self.showErrorNotification = showErrorNotification;
  self.logError = logError;
}