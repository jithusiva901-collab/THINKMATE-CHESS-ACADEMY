document.addEventListener('DOMContentLoaded', () => {
    // -------------------------------------------------------------
    // 1. Navigation Menu Dropdown Toggle
    // -------------------------------------------------------------
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }

    // -------------------------------------------------------------
    // 2. Logout Functionality
    // -------------------------------------------------------------
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('isLoggedIn');
            alert('You have been logged out.');
            window.location.href = 'login.html';
        });
    }
});

// -------------------------------------------------------------
// 3. Image Fullscreen Lightbox Modal Functions
// -------------------------------------------------------------
function openModal(element) {
    const modal = document.getElementById('imageModal');
    const enlargedImg = document.getElementById('enlargedImg');
    
    if (modal && enlargedImg) {
        modal.style.display = 'flex';
        enlargedImg.src = element.src;
    }
}

function closeModal() {
    const modal = document.getElementById('imageModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Close modal when pressing ESC key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
    }
});
// Function to update the unread count number on the icon
function updateUnreadBadge() {
    const badge = document.getElementById('unreadBadge');
    if (!badge) return;

    const messages = JSON.parse(localStorage.getItem('userMessages')) || [];
    // Count messages marked as unread (or total messages if unread flag isn't set)
    const unreadCount = messages.filter(msg => msg.unread === true || msg.unread === undefined).length;

    if (unreadCount > 0) {
        badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
        badge.style.display = 'inline-block';
    } else {
        badge.style.display = 'none';
    }
}

// Run when DOM loads
document.addEventListener('DOMContentLoaded', () => {
    updateUnreadBadge();
});