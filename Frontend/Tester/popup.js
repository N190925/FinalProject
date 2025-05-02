let currentErrors = [];
let displayErrors = [];
let currentErrorIndex = 0;
let currentUrl = '';
const MAX_ATTEMPTS = 3;

async function runValidation() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  currentUrl = tab.url;
  
  await validateHTML(tab);
  await validateResources(tab);
}

async function validateHTML(tab) {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: validatePageContent,
  }, (results) => {
    if (!results || !results[0]) {
      handleError("Could not validate page content");
      return;
    }
    
    currentErrors = results[0].result;
    currentErrorIndex = 0;
    updateDisplay();
  });
}

function updateDisplay() {
    const resultsDiv = document.getElementById("results");
    const showAllErrorsButton = document.getElementById('showAllErrors');
    const errorCounter = document.querySelector('.error-counter');
    const sliderContainer = document.querySelector('.slider-container');
    
    if (!resultsDiv) return;
    
    resultsDiv.innerHTML = "";
    
    // Remove duplicate errors based on message
    const uniqueErrors = Array.from(new Set(currentErrors.map(error => error.message)))
        .map(message => currentErrors.find(error => error.message === message));
    
    // Store unique errors for display
    displayErrors = [...uniqueErrors];
    
    // Take only first 2 errors for popup display
    const popupErrors = uniqueErrors.slice(0, 2);
    
    if (popupErrors.length > 0) {
        // Show current error
        const error = popupErrors[currentErrorIndex];
        const errorDiv = document.createElement('div');
        
        const stackoverflowUrl = `https://stackoverflow.com/search?q=${encodeURIComponent(error.message)}`;
        errorDiv.innerHTML = `
            <div class="error">
                <a href="${stackoverflowUrl}" target="_blank" class="error-link">
                    ${error.message}
                </a>
            </div>
        `;
        resultsDiv.appendChild(errorDiv);
        
        // Show total number of unique errors in counter
        if (errorCounter) {
            errorCounter.textContent = `${currentErrorIndex + 1} out of ${uniqueErrors.length}`;
        }
        
        // Show navigation if we have 2 errors
        if (popupErrors.length === 2) {
            if (sliderContainer) {
                sliderContainer.style.display = 'block';
            }
            
            // Show "Click Here" button on second error
            if (showAllErrorsButton) {
                if (currentErrorIndex === 1) {
                    showAllErrorsButton.style.display = 'block';
                    const messageDiv = document.createElement('div');
                    messageDiv.className = 'click-here-message';
                    messageDiv.innerHTML = 'To Make Your Website Error-Free:<br>Click Below:';
                    resultsDiv.appendChild(messageDiv);
                    showAllErrorsButton.textContent = 'Click Here';
                    showAllErrorsButton.classList.add('attention');
                } else {
                    showAllErrorsButton.style.display = 'none';
                    const existingMessage = document.querySelector('.click-here-message');
                    if (existingMessage) {
                        existingMessage.remove();
                    }
                    showAllErrorsButton.classList.remove('attention');
                }
            }
        } else {
            if (sliderContainer) {
                sliderContainer.style.display = 'none';
            }
            if (showAllErrorsButton) {
                showAllErrorsButton.style.display = 'block';
            }
        }
    } else {
        resultsDiv.innerHTML = `<div class="no-error">No errors found.</div>`;
        if (sliderContainer) sliderContainer.style.display = 'none';
        if (showAllErrorsButton) showAllErrorsButton.style.display = 'none';
    }
    
    updateNavigationButtons();
}

function updateNavigationButtons() {
    const prevButton = document.getElementById('prevError');
    const nextButton = document.getElementById('nextError');
    
    if (prevButton) {
        prevButton.disabled = currentErrorIndex === 0;
    }
    if (nextButton) {
        // Only enable next button if there's a second error
        nextButton.disabled = currentErrorIndex === 1 || currentErrors.slice(0, 2).length < 2;
    }
}

function blockAllPopups() {
    // Hide both sections and show a blocked message
    document.getElementById('input-section').style.display = 'none';
    document.getElementById('validation-section').style.display = 'none';

    let blockedDiv = document.createElement('div');
    blockedDiv.id = 'blocked-message';
    blockedDiv.style.color = 'red';
    blockedDiv.style.textAlign = 'center';
    blockedDiv.style.fontWeight = 'bold';
    blockedDiv.style.marginTop = '40px';
    blockedDiv.textContent = "You have exceeded the maximum number of attempts. Access blocked.";
    document.querySelector('.container').appendChild(blockedDiv);
}

document.addEventListener('DOMContentLoaded', () => {
    const submitButton = document.getElementById('submitButton');
    const inputSection = document.getElementById('input-section');
    const validationSection = document.getElementById('validation-section');

    submitButton.addEventListener('click', () => {
        const inputText = document.getElementById('inputText').value;
        localStorage.setItem('submittedText', inputText);

        // Directly show validation section and run validation (2nd popup)
        inputSection.style.display = 'none';
        validationSection.style.display = 'block';
        runValidation();
    });

    // Navigation controls for errors
    const prevButton = document.getElementById('prevError');
    const nextButton = document.getElementById('nextError');
    if (prevButton) {
        prevButton.addEventListener('click', () => {
            if (currentErrorIndex > 0) {
                currentErrorIndex--;
                updateDisplay();
            }
        });
    }
    if (nextButton) {
        nextButton.addEventListener('click', () => {
            if (currentErrorIndex < currentErrors.length - 1) {
                currentErrorIndex++;
                updateDisplay();
            }
        });
    }

    // Show all errors button
    document.getElementById('showAllErrors')?.addEventListener('click', () => {
        try {
            const displayUrl = chrome.runtime.getURL('design/display.html');
            chrome.tabs.create({ 
                url: displayUrl,
                active: true
            }, (tab) => {
                localStorage.setItem('validationErrors', JSON.stringify(displayErrors));
                localStorage.setItem('validatedUrl', currentUrl);
            });
        } catch (error) {
            console.error('Error opening display page:', error);
            const resultsDiv = document.getElementById("results");
            if (resultsDiv) {
                resultsDiv.innerHTML = `<div class="error">Error opening display page. Please try again.</div>`;
            }
        }
    });
});

function handleError(message) {
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = `<div class="error">Error: ${message}</div>`;
}

async function validateResources(tab) {
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: getLinkedResources,
    }, async (results) => {
        if (!results || !results[0]) return;

        const resources = results[0].result;
        
        for (const resource of resources) {
            // Check if resource is a local file
            if (resource.url.startsWith('file://')) {
                currentErrors.push({
                    message: `[Resource] Local file access not allowed: ${resource.url.split('/').pop()}`,
                    fileType: resource.type.toUpperCase(),
                    severity: "Warning"
                });
                continue;
            }

            try {
                const response = await fetch(resource.url);
                if (!response.ok) {
                    currentErrors.push({
                        message: `[${resource.type.toUpperCase()}] Failed to load: ${resource.url}`,
                        fileType: resource.type.toUpperCase()
                    });
                }
            } catch (error) {
                // Only add error if it's not a local file access issue
                if (!error.message.includes('local file')) {
                    currentErrors.push({
                        message: `[${resource.type.toUpperCase()}] Resource error: ${resource.url}`,
                        fileType: resource.type.toUpperCase()
                    });
                }
            }
        }
        
        updateDisplay();
    });
}

function getLinkedResources() {
    const resources = [];
    const seenUrls = new Set(); // To prevent duplicate resources

    // Helper function to add resource if not already seen
    const addResource = (url, type) => {
        if (!seenUrls.has(url)) {
            seenUrls.add(url);
            resources.push({ url, type });
        }
    };

    // Check stylesheets
    document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
        if (link.href) {
            addResource(link.href, 'css');
        }
    });

    // Check scripts
    document.querySelectorAll('script[src]').forEach(script => {
        if (script.src) {
            addResource(script.src, 'javascript');
        }
    });

    // Check images
    document.querySelectorAll('img[src]').forEach(img => {
        if (img.src) {
            addResource(img.src, 'image');
        }
    });

    return resources;
}

function validateCSSContent(content, url) {
  const cssErrors = [];
  
  if (content.includes('position: fixed') && !content.includes('z-index')) {
    cssErrors.push({
      message: `[CSS] Fixed position without z-index`,
      fileType: "CSS",
      url: url
    });
  }

  const importantCount = (content.match(/!important/g) || []).length;
  if (importantCount > 3) {
    cssErrors.push({
      message: `[CSS] Excessive use of !important (${importantCount} times)`,
      fileType: "CSS",
      url: url
    });
  }

  const vendorPrefixes = ['-webkit-', '-moz-', '-ms-', '-o-'];
  vendorPrefixes.forEach(prefix => {
    if (content.includes(prefix) && !content.includes('@supports')) {
      cssErrors.push({
        message: `[CSS] Vendor prefix ${prefix} used without @supports`,
        fileType: "CSS",
        url: url
      });
    }
  });
  
  if (content.includes('*{')) {
    cssErrors.push({
      message: `[CSS] Universal selector (*) usage may impact performance`,
      fileType: "CSS",
      url: url
    });
  }

  if (content.includes('@import')) {
    cssErrors.push({
      message: `[CSS] @import usage can slow down page loading`,
      fileType: "CSS",
      url: url
    });
  }

  const rgbaCount = (content.match(/rgba?\(/g) || []).length;
  if (rgbaCount > 10) {
    cssErrors.push({
      message: `[CSS] High usage of RGB/RGBA colors (${rgbaCount} times) - consider using variables`,
      fileType: "CSS",
      url: url
    });
  }

  if (content.includes('calc(')) {
    cssErrors.push({
      message: `[CSS] calc() usage detected - verify browser compatibility`,
      fileType: "CSS",
      url: url
    });
  }
  
  currentErrors = [...currentErrors, ...cssErrors];
}

function validateJSContent(content, url) {
  const jsErrors = [];
  
  if (content.includes('var ')) {
    jsErrors.push({
      message: `[JavaScript] Use of 'var' keyword found - use let/const instead`,
      fileType: "JavaScript",
      url: url
    });
  }

  if (content.includes('console.log(')) {
    jsErrors.push({
      message: `[JavaScript] console.log statements found`,
      fileType: "JavaScript",
      url: url
    });
  }

  if (content.includes('eval(')) {
    jsErrors.push({
      message: `[JavaScript] Dangerous eval() usage detected`,
      fileType: "JavaScript",
      url: url
    });
  }

  if (content.includes('try {') && !content.includes('catch')) {
    jsErrors.push({
      message: `[JavaScript] Incomplete try/catch block`,
      fileType: "JavaScript",
      url: url
    });
  }

  if (content.includes('document.write(')) {
    jsErrors.push({
      message: `[JavaScript] Unsafe document.write() usage detected`,
      fileType: "JavaScript",
      url: url
    });
  }

  if (content.includes('innerHTML') && !content.includes('DOMPurify')) {
    jsErrors.push({
      message: `[JavaScript] Unsafe innerHTML usage without DOMPurify`,
      fileType: "JavaScript",
      url: url
    });
  }

  if (content.includes('onclick=')) {
    jsErrors.push({
      message: `[JavaScript] Inline event handlers detected - use addEventListener instead`,
      fileType: "JavaScript",
      url: url
    });
  }

  if (content.includes('new Function(')) {
    jsErrors.push({
      message: `[JavaScript] Unsafe new Function() constructor usage`,
      fileType: "JavaScript",
      url: url
    });
  }
  
  currentErrors = [...currentErrors, ...jsErrors];
}

function validatePageContent() {
    const errors = [];

    // HTML Validation - Core Attributes
    function validateHTML(errors) {
        // Document Structure
        const structureChecks = {
            'html[lang]': 'Language attribute missing in HTML tag',
            'head': 'Head section missing',
            'body': 'Body section missing',
            'title': 'Title tag missing',
            'meta[name="viewport"]': 'Viewport meta tag missing'
        };

        Object.entries(structureChecks).forEach(([selector, message]) => {
            if (!document.querySelector(selector)) {
                errors.push({
                    message: `[HTML] ${message}`,
                    fileType: "HTML",
                    severity: "High",
                    suggestion: `Add ${selector} element`
                });
            }
        });

        // Form Elements
        document.querySelectorAll('form').forEach((form, index) => {
            if (!form.hasAttribute('action')) {
                errors.push({
                    message: `[HTML] Form #${index + 1} missing action attribute`,
                    fileType: "HTML",
                    severity: "High",
                    suggestion: "Add action attribute to form"
                });
            }

            if (!form.hasAttribute('method')) {
                errors.push({
                    message: `[HTML] Form #${index + 1} missing method attribute`,
                    fileType: "HTML",
                    severity: "Medium",
                    suggestion: "Specify form method (GET/POST)"
                });
            }
        });

        // Input Elements
        document.querySelectorAll('input').forEach((input, index) => {
            if (!input.hasAttribute('type')) {
                errors.push({
                    message: `[HTML] Input #${index + 1} missing type attribute`,
                    fileType: "HTML",
                    severity: "High",
                    suggestion: "Specify input type attribute"
                });
            }
        });

        // Image Elements
        document.querySelectorAll('img').forEach((img, index) => {
            if (!img.hasAttribute('alt')) {
                errors.push({
                    message: `[HTML] Image #${index + 1} missing alt attribute`,
                    fileType: "HTML",
                    severity: "High",
                    suggestion: "Add descriptive alt text"
                });
            }
        });

        // Link Elements
        document.querySelectorAll('a').forEach((link, index) => {
            if (!link.hasAttribute('href')) {
                errors.push({
                    message: `[HTML] Link #${index + 1} missing href attribute`,
                    fileType: "HTML",
                    severity: "Medium",
                    suggestion: "Add proper href attribute"
                });
            }
        });
    }

    // CSS Validation - Core Properties
    function validateCSS(errors) {
        document.querySelectorAll('*').forEach((element, index) => {
            const style = window.getComputedStyle(element);

            // Position Properties
            if (style.position === 'absolute' || style.position === 'fixed') {
                if (!style.top && !style.bottom && !style.left && !style.right) {
                    errors.push({
                        message: `[CSS] Element #${index + 1} with ${style.position} position missing offset properties`,
                        fileType: "CSS",
                        severity: "Medium",
                        suggestion: "Add positioning properties (top/right/bottom/left)"
                    });
                }
            }

            // Z-index Usage
            if (style.zIndex !== 'auto' && style.position === 'static') {
                errors.push({
                    message: `[CSS] Element #${index + 1} has z-index but position is static`,
                    fileType: "CSS",
                    severity: "Low",
                    suggestion: "Add position property for z-index to work"
                });
            }

            // Display Properties
            if (style.display === 'flex' || style.display === 'grid') {
                if (!style.gap && !style.rowGap && !style.columnGap) {
                    errors.push({
                        message: `[CSS] ${style.display} container #${index + 1} missing gap properties`,
                        fileType: "CSS",
                        severity: "Low",
                        suggestion: "Consider adding gap properties for better spacing"
                    });
                }
            }
        });

        // Style Tag Usage
        if (document.querySelectorAll('style').length > 0) {
            errors.push({
                message: "[CSS] Internal <style> tags found",
                fileType: "CSS",
                severity: "Medium",
                suggestion: "Move styles to external stylesheet"
            });
        }
    }

    // JavaScript Validation - Core Features
    function validateJavaScript(errors) {
        // Script Attributes
        document.querySelectorAll('script').forEach((script, index) => {
            if (!script.hasAttribute('type') && !script.hasAttribute('language')) {
                errors.push({
                    message: `[JavaScript] Script #${index + 1} missing type attribute`,
                    fileType: "JavaScript",
                    severity: "Low",
                    suggestion: "Add type='text/javascript' or type='module'"
                });
            }

            if (script.hasAttribute('async') && script.hasAttribute('defer')) {
                errors.push({
                    message: `[JavaScript] Script #${index + 1} has both async and defer`,
                    fileType: "JavaScript",
                    severity: "Medium",
                    suggestion: "Use either async or defer, not both"
                });
            }
        });

        // Event Handlers
        const inlineEvents = ['onclick', 'onload', 'onsubmit', 'onchange'];
        inlineEvents.forEach(event => {
            document.querySelectorAll(`[${event}]`).forEach((element, index) => {
                errors.push({
                    message: `[JavaScript] Inline ${event} handler found on element #${index + 1}`,
                    fileType: "JavaScript",
                    severity: "Medium",
                    suggestion: "Use addEventListener instead of inline handlers"
                });
            });
        });
    }

    // Run Validations
    validateHTML(errors);
    validateCSS(errors);
    validateJavaScript(errors);

    return errors;
}

