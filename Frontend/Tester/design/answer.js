document.addEventListener('DOMContentLoaded', () => {
    const errorRaw = localStorage.getItem('selectedError');
    const error = errorRaw ? JSON.parse(errorRaw) : null;

    if (error && error.message) {
        document.getElementById('errorType').textContent = `${error.fileType || 'Error'} Details`;
        document.getElementById('errorMessage').textContent = error.message;
        document.getElementById('errorSuggestion').textContent = generateSuggestion(error);
        document.getElementById('errorCode').textContent = error.code || 'No code snippet available.';
    }

    document.getElementById('stackoverflowBtn')?.addEventListener('click', () => {
        const query = encodeURIComponent(`${error?.fileType || ''} ${error?.message || 'web development error'}`);
        window.open(`https://stackoverflow.com/search?q=${query}`, '_blank');
    });

    document.getElementById('tryValidatorBtn')?.addEventListener('click', () => {
        // Expand layout
        document.getElementById('splitContainer').classList.add('expanded');

        // Show static QR image
        document.getElementById('qrImage').style.display = 'block';

        // Show close button
        document.getElementById('closeQrBtn').style.display = 'block';

        // Generate QR code
        const qrContainer = document.getElementById('qrContainer');
        qrContainer.innerHTML = ''; // clear previous

        const validatorUrl = window.location.origin + '/now/Tester/design/Layout.html';
        new QRCode(qrContainer, {
            text: validatorUrl,
            width: 200,
            height: 200
        });
    });

    // Close QR panel logic
    document.getElementById('closeQrBtn')?.addEventListener('click', () => {
        document.getElementById('splitContainer').classList.remove('expanded');
        document.getElementById('closeQrBtn').style.display = 'none';
    });
});

// Suggestion generator remains the same
function generateSuggestion(error) {
    // ... (your existing suggestion map)
    return 'Review and fix the issue according to web development best practices.';
}
