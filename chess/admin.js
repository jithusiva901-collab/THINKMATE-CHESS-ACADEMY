document.addEventListener('DOMContentLoaded', () => {
    // -------------------------------------------------------------
    // 1. DOM Elements
    // -------------------------------------------------------------
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    const logoutBtn = document.getElementById('logoutBtn');
    const messagesList = document.getElementById('messagesList');
    const clearAllBtn = document.getElementById('clearAllBtn');
    const badge = document.getElementById('unreadBadge');

    // Key names used for storing messages
    const STORAGE_KEYS = ['academyMessages', 'userMessages'];

    // -------------------------------------------------------------
    // 2. Navigation & Dropdown Handler
    // -------------------------------------------------------------
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            navMenu.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
                navMenu.classList.remove('active');
            }
        });
    }

    // -------------------------------------------------------------
    // 3. Logout Handler
    // -------------------------------------------------------------
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('isLoggedIn');
            sessionStorage.removeItem('isLoggedIn');
            sessionStorage.removeItem('currentUser');
            window.location.href = 'register.html';
        });
    }

    // -------------------------------------------------------------
    // 4. Message Storage Helpers
    // -------------------------------------------------------------
    function getStoredMessages() {
        for (const key of STORAGE_KEYS) {
            const data = localStorage.getItem(key);
            if (data) {
                try {
                    return { key, messages: JSON.parse(data) };
                } catch (err) {
                    console.error(`Error parsing JSON from ${key}:`, err);
                }
            }
        }
        return { key: 'academyMessages', messages: [] };
    }

    // -------------------------------------------------------------
    // 5. Render Messages
    // -------------------------------------------------------------
    function displayMessages() {
        if (!messagesList) return;

        const { messages } = getStoredMessages();

        if (!messages.length) {
            messagesList.innerHTML = '<p class="no-messages">No messages received yet.</p>';
            return;
        }

        messagesList.innerHTML = messages
            .map((msg) => `
                <div class="message-card">
                    <div class="message-header">
                        <h4>${escapeHtml(msg.name || 'Anonymous')}</h4>
                        <span class="message-timestamp">${escapeHtml(msg.timestamp || msg.date || '')}</span>
                    </div>
                    <div class="message-meta">
                        <span>📧 ${escapeHtml(msg.email || 'N/A')}</span>
                        <span>📞 ${escapeHtml(msg.phone || 'N/A')}</span>
                    </div>
                    <div class="message-text">
                        ${escapeHtml(msg.message || 'No content')}
                    </div>
                </div>
            `)
            .reverse()
            .join('');
    }

    // -------------------------------------------------------------
    // 6. Mark Messages as Read & Update Badge
    // -------------------------------------------------------------
    function markMessagesAsRead() {
        STORAGE_KEYS.forEach((key) => {
            const rawData = localStorage.getItem(key);
            if (rawData) {
                try {
                    const messages = JSON.parse(rawData);
                    const updated = messages.map((msg) => ({ ...msg, unread: false }));
                    localStorage.setItem(key, JSON.stringify(updated));
                } catch (err) {
                    console.error(`Error updating read status for ${key}:`, err);
                }
            }
        });

        if (badge) {
            badge.textContent = '0';
            badge.style.display = 'none';
        }
    }

    // -------------------------------------------------------------
    // 7. Clear All Messages
    // -------------------------------------------------------------
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to delete all stored messages?')) {
                STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
                displayMessages();
                markMessagesAsRead();
            }
        });
    }

    // Initial Execution
    displayMessages();
    markMessagesAsRead();
});

// -------------------------------------------------------------
// Helper: Escape HTML to Prevent XSS
// -------------------------------------------------------------
function escapeHtml(text) {
    if (!text) return '';
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
// In admin.js
const adminLogoutBtn = document.getElementById('adminLogoutBtn');

if (adminLogoutBtn) {
    adminLogoutBtn.addEventListener('click', () => {
        localStorage.removeItem('isAdminLoggedIn');
        localStorage.removeItem('activeAdminName');
        alert('Logged out successfully.');
        window.location.href = 'home.html'; // Redirects back to Home Page
    });
}