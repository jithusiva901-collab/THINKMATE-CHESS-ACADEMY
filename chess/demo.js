// DOM Elements
const addButton = document.getElementById('add-popup-button');
const overlay = document.querySelector('.overlay');
const popupBox = document.querySelector('.popupbox');
const cancelButton = document.getElementById('cancel-popup');
const addBookButton = document.getElementById('add-book');
const container = document.querySelector('.container');
const nameInput = document.getElementById('book-title-input');
const reviewInput = document.getElementById('book-description-input');
const toast = document.getElementById('toast-notification');

// Open Popup
function show() {
    overlay.style.display = 'block';
    popupBox.style.display = 'flex';
}

// Close Popup
function hide() {
    overlay.style.display = 'none';
    popupBox.style.display = 'none';
}

// Show Toast Notification
function showNotification(message) {
    toast.textContent = message;
    toast.classList.add('show');
    
    // Auto-hide notification after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Event Listeners
addButton.addEventListener('click', show);

cancelButton.addEventListener('click', function (e) {
    e.preventDefault();
    hide();
});

overlay.addEventListener('click', hide);

// Add Review & Display Notification
addBookButton.addEventListener('click', function (e) {
    e.preventDefault(); // Prevent page refresh

    const name = nameInput.value.trim();
    const review = reviewInput.value.trim();

    // Validation check
    if (!name || !review) {
        alert('Please fill out both your name and review!');
        return;
    }

    // Create dynamic review card
    const card = document.createElement('div');
    card.classList.add('book-container');
    card.innerHTML = `
        <h2>Customer Review</h2>
        <h5>${name}</h5>
        <p>${review}</p>
        <button onclick="deletbook(event)">Delete</button>
    `;

    container.appendChild(card);

    // Reset fields and close modal
    nameInput.value = '';
    reviewInput.value = '';
    hide();

    // Show Success Notification
    showNotification('Thank you! Your review has been added. ♕');
});

// Delete Review Card with Confirmation
function deletbook(event) {
    const confirmDelete = confirm('Are you sure you want to delete this review?');
    if (confirmDelete) {
        event.target.parentElement.remove();
        showNotification('Review deleted.');
    }
}

