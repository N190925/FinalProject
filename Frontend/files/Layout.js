// Function to handle "Try Now" button click and fetch GET API
function handleTryNowClick() {
    alert("Please Wait....\nYour Zip File is Downloading.......!");
    const apiUrl = 'http://192.168.172.124:8989/errordetector/download';
    
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`API Error: ${response.status} - ${response.statusText}`);
            }
            // For ZIP file download, handle the response as Blob (binary data)
            return response.blob();
        })
        .then(blob => {
            // Create a link element to download the file
            const downloadLink = document.createElement('a');
            downloadLink.href = URL.createObjectURL(blob); // Create an object URL for the Blob
            downloadLink.download = 'ErrorDetection.zip'; // Set the file name for the download
            downloadLink.click(); // Trigger the download by clicking the link

            alert('ZIP file downloaded successfully');
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

// Add event listener to the "Try Now" button
document.querySelector('.try-now-button').addEventListener('click', handleTryNowClick);

// Scroll visibility of rating section
function handleScroll() {
    const ratingSection = document.querySelector('.rating-section');
    if (!ratingSection) return; // Guard clause if element doesn't exist
    
    const sectionPosition = ratingSection.getBoundingClientRect().top;
    const screenPosition = window.innerHeight / 1.3;

    if (sectionPosition < screenPosition) {
        ratingSection.classList.add('visible');
        window.removeEventListener('scroll', handleScroll); // Remove scroll listener once section is visible
    }
}

// Initialize rating system
function initRatingSystem() {
    const stars = document.querySelectorAll('.star');
    const feedbackElement = document.querySelector('.rating-feedback');
    let selectedRating = 0;

    // Handle star click, hover, and reset interactions
    stars.forEach((star, index) => {
        star.addEventListener('click', () => {
            selectedRating = index + 1;
            updateStars(stars, selectedRating);
            updateFeedback(feedbackElement, selectedRating);
        });

        star.addEventListener('mouseover', () => highlightStars(stars, index));
        star.addEventListener('mouseleave', () => resetStars(stars, selectedRating));
    });
}

// Update selected stars based on rating
function updateStars(stars, rating) {
    stars.forEach((star, index) => {
        star.classList.toggle('selected', index < rating);
    });
}

// Highlight stars on hover
function highlightStars(stars, index) {
    stars.forEach((star, i) => {
        star.classList.toggle('selected', i <= index);
    });
}

// Reset stars to selected rating
function resetStars(stars, selectedRating) {
    stars.forEach((star, i) => {
        star.classList.toggle('selected', i < selectedRating);
    });
}

// Update feedback text based on rating
function updateFeedback(feedbackElement, rating) {
    if (!feedbackElement) return;

    const feedback = {
        1: 'Poor',
        2: 'Fair',
        3: 'Good',
        4: 'Very Good',
        5: 'Excellent'
    };

    feedbackElement.textContent = feedback[rating] || 'Click a star to rate';
}

// Handle rating submission with feedback form
document.addEventListener('DOMContentLoaded', () => {
    const stars = document.querySelectorAll('.star');
    const feedbackForm = document.querySelector('.feedback-form');
    const feedbackText = document.querySelector('.rating-feedback');
    const submitButton = document.querySelector('.submit-rating');
    let selectedRating = 0;

    // Handle star rating functionality
    stars.forEach((star, index) => {
        star.addEventListener('click', () => {
            selectedRating = index + 1;
            updateStars(stars, selectedRating);
            showFeedbackForm();
            updateFeedbackText(selectedRating);
        });

        star.addEventListener('mouseover', () => highlightStars(stars, index));
        star.addEventListener('mouseleave', () => resetStars(stars, selectedRating));
    });

    // Show feedback form after rating
    function showFeedbackForm() {
        feedbackForm.style.display = 'block';
    }

    // Update feedback text based on rating
    function updateFeedbackText(rating) {
        const feedbackMessages = {
            1: 'We\'re sorry to hear that. Please tell us why...',
            2: 'How can we improve?',
            3: 'What would make your experience better?',
            4: 'Glad you had a good experience! Any suggestions?',
            5: 'Excellent! Tell us what you loved most...'
        };
        feedbackText.textContent = feedbackMessages[rating];
    }

    // Handle rating submission
    submitButton.addEventListener('click', () => {
        const comment = document.getElementById('rating-comment').value;
        if (comment.trim() === '') {
            alert('Please provide feedback before submitting.');
            return;
        }

        // Show success message
        alert('Thank you for your feedback!');

        // Reset the form
        selectedRating = 0;
        resetStars(stars, selectedRating);
        feedbackForm.style.display = 'none';
        feedbackText.textContent = 'Click a star to rate';
        document.getElementById('rating-comment').value = '';
    });
});

// Function to toggle profile menu visibility and display the username
function toggleProfileMenu() {
    const dropdown = document.querySelector('.profile-dropdown');
    const usernameDisplay = document.querySelector('.profile-username'); // Element to display the username
    const username = localStorage.getItem('username') || 'Guest'; // Fetching username from localStorage or default to 'Guest'

    // Display the username in the profile menu
    if (usernameDisplay) {
        usernameDisplay.textContent = username;
    }

    // Toggle the dropdown menu visibility
    dropdown.classList.toggle('active');

    // Close dropdown when clicking outside
    document.addEventListener('click', function (event) {
        const isClickInside = dropdown.contains(event.target) || event.target.closest('.profile-icon');
        if (!isClickInside) {
            dropdown.classList.remove('active');
        }
    });
}

// Example of how to store the username after a successful login (this would happen after login)
function loginUser(username) {
    localStorage.setItem('username', username); // Store the username in localStorage
    toggleProfileMenu(); // Update the profile menu with the username
}

// Add event listener to the profile icon (to toggle the profile menu)
document.querySelector('.profile-icon').addEventListener('click', toggleProfileMenu);

// Initialize scroll visibility and rating system
document.addEventListener('DOMContentLoaded', () => {
    window.addEventListener('scroll', handleScroll);
    initRatingSystem();
    
    // Initial check in case section is already in view
    handleScroll();
});

// Function to reload or navigate to a specific page (index.html or current page)
function handleHomeButtonClick() {
    // Reload the current page
    window.location.href = window.location.href;
}

// Add event listener to the "Home" button
document.querySelector('.home-button').addEventListener('click', handleHomeButtonClick);