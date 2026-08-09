document.addEventListener('DOMContentLoaded', () => {
    // Menu Icon Toggle
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }

    // Handle Contact Form Submit
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // 1. Capture Form Inputs
            const messageData = {
                id: Date.now(),
                name: document.getElementById('contactName').value,
                email: document.getElementById('contactEmail').value,
                phone: document.getElementById('contactPhone').value,
                message: document.getElementById('contactMessage').value,
                date: new Date().toLocaleString()
            };

            // 2. Fetch existing messages array or create a new one
            const savedMessages = JSON.parse(localStorage.getItem('academyMessages')) || [];

            // 3. Add new message
            savedMessages.push(messageData);

            // 4. Save back to localStorage
            localStorage.setItem('academyMessages', JSON.stringify(savedMessages));

            alert(`Thank you, ${messageData.name}! Your message has been sent successfully.`);
            
            // 5. Clear Form
            contactForm.reset();
        });
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