document.addEventListener('DOMContentLoaded', () => {
    try {
        const validationErrors = JSON.parse(localStorage.getItem('validationErrors') || '[]');
        const validatedUrl = localStorage.getItem('validatedUrl');
        
        // Update header with URL and timestamp
        const headerParagraph = document.querySelector('.header p');
        headerParagraph.innerHTML = `
            <span class="file-info">URL: <strong>${validatedUrl || 'Unknown URL'}</strong></span>
            <span class="timestamp">Scanned: ${new Date().toLocaleString()}</span>
            <span class="error-count">${validationErrors.length} issues found</span>
        `;

        // Calculate severity counts
        const severityCounts = {
            high: 0,
            medium: 0,
            low: 0
        };

        // Update stats with proper severity mapping
        validationErrors.forEach(error => {
            const severity = error.severity || determineSeverity(error.fileType);
            if (severity === 'High') severityCounts.high++;
            else if (severity === 'Medium') severityCounts.medium++;
            else severityCounts.low++;
        });

        // Update stats display
        document.getElementById('totalErrors').textContent = validationErrors.length;
        document.getElementById('highSeverity').textContent = severityCounts.high;
        document.getElementById('mediumSeverity').textContent = severityCounts.medium;
        document.getElementById('lowSeverity').textContent = severityCounts.low;

        // Display errors
        const errorsContainer = document.getElementById('errorsContainer');
        
        if (validationErrors && validationErrors.length > 0) {
            // Sort errors by severity (High -> Medium -> Low)
            const sortedErrors = validationErrors.sort((a, b) => {
                const severityOrder = { 'High': 0, 'Medium': 1, 'Low': 2 };
                const severityA = a.severity || determineSeverity(a.fileType);
                const severityB = b.severity || determineSeverity(b.fileType);
                return severityOrder[severityA] - severityOrder[severityB];
            });

            sortedErrors.forEach((error, index) => {
                const severity = error.severity || determineSeverity(error.fileType);
                const severityClass = `severity-${severity.toLowerCase()}`;

                const errorDiv = document.createElement('div');
                errorDiv.className = 'error-item';
                errorDiv.innerHTML = `
                    <div class="error-header">
                        <span class="error-type">${error.fileType} Error #${index + 1}</span>
                        <span class="error-severity ${severityClass}">${severity}</span>
                    </div>
                    <div class="error-message">${error.message}</div>
                    <a href="#" class="error-link">
                        Click here for more
                    </a>
                `;
                errorsContainer.appendChild(errorDiv);

                // Add redirect to answer.html and store error in localStorage
                const link = errorDiv.querySelector('.error-link');
                link.addEventListener('click', function(event) {
                    event.preventDefault();
                    // Store the error object in localStorage
                    localStorage.setItem('selectedError', JSON.stringify(error));
                    window.open('answer.html', '_blank');
                });
            });
        } else {
            errorsContainer.innerHTML = '<div class="loading">No errors found in the validation.</div>';
        }

        // Clear storage after displaying
        localStorage.removeItem('validationErrors');
        localStorage.removeItem('validatedUrl');
    } catch (error) {
        console.error('Error displaying validation results:', error);
        document.getElementById('errorsContainer').innerHTML = 
            '<div class="error">Error loading validation results.</div>';
    }

    // Scroll to top functionality
    const scrollToTopButton = document.getElementById('scrollToTop');

    // Show button when user scrolls down 300px
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            scrollToTopButton.classList.add('visible');
        } else {
            scrollToTopButton.classList.remove('visible');
        }
    });

    // Smooth scroll to top when button is clicked
    scrollToTopButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
});

// Updated severity mapping function
function determineSeverity(fileType) {
    const severityMap = {
        'HTML': 'High',
        'JavaScript': 'High',
        'CSS': 'Medium',
        'Structure': 'High',
        'Syntax': 'High',
        'Style': 'Low',
        'Format': 'Low'
    };
    return severityMap[fileType] || 'Medium';
}

// Updated suggestion generator with more specific suggestions
function generateSuggestion(error) {
    const suggestions = {
        'HTML': {
            'doctype': 'Add <!DOCTYPE html> declaration at the start of the document',
            'meta': 'Add required meta tags in the head section',
            'structure': 'Use proper HTML5 semantic elements',
            'empty': 'Remove empty elements or add content',
            'deprecated': 'Replace deprecated elements with modern alternatives',
            'form': 'Add proper form validation and submit buttons',
            'table': 'Use proper table structure with thead and tbody'
        },
        'CSS': {
            'inline': 'Move inline styles to an external stylesheet',
            'important': 'Remove !important declarations and improve specificity',
            'empty': 'Remove empty CSS rules',
            'selector': 'Simplify complex CSS selectors',
            'specificity': 'Reduce selector specificity',
            'duplicate': 'Remove duplicate CSS rules'
        },
        'JavaScript': {
            'script': 'Add defer or async attributes to script tags',
            'event': 'Replace inline event handlers with addEventListener',
            'jquery': 'Update jQuery or consider using vanilla JavaScript',
            'error': 'Implement proper error handling',
            'global': 'Avoid global variables and namespace pollution',
            'performance': 'Optimize JavaScript code execution'
        }
    };

    const errorType = error.fileType?.toLowerCase() || '';
    const errorMsg = error.message?.toLowerCase() || '';
    
    for (const [type, typesuggestions] of Object.entries(suggestions)) {
        if (errorType.includes(type.toLowerCase())) {
            for (const [key, suggestion] of Object.entries(typesuggestions)) {
                if (errorMsg.includes(key)) {
                    return suggestion;
                }
            }
        }
    }

    return 'Review and fix the issue according to web development best practices.';
}