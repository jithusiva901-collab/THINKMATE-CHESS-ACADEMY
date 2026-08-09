document.addEventListener('DOMContentLoaded', () => {
    // 1. Navigation Menu Dropdown Toggle
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');

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

    // Update message notification badge
    updateUnreadBadge();

    // 2. Logout Handler
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function (e) {
            e.preventDefault();
            localStorage.removeItem('isAdminLoggedIn');
            sessionStorage.removeItem('currentAdmin');
            window.location.href = 'admin-login.html';
        });
    }

    // 3. Check if Admin is Already Logged In & Display Info Card
    renderAdminStatusCard();
});

// Modal Elements
const addButton = document.getElementById('add-popup-button');
const overlay = document.querySelector('.overlay');
const popupBox = document.querySelector('.popupbox');
const cancelButton = document.getElementById('cancel-popup');
const adminLoginForm = document.getElementById('adminLoginForm');
const adminContainer = document.getElementById('adminContainer');

// Show Modal
function show() {
    if (overlay && popupBox) {
        overlay.style.display = 'block';
        popupBox.style.display = 'block';
    }
}

// Hide Modal
function hide() {
    if (overlay && popupBox) {
        overlay.style.display = 'none';
        popupBox.style.display = 'none';
    }
}

// Modal Event Listeners
if (addButton) addButton.addEventListener('click', show);
if (cancelButton) cancelButton.addEventListener('click', hide);
if (overlay) overlay.addEventListener('click', hide);

// Toast Notification Helper
function showNotification(message) {
    let toast = document.getElementById('toast-notification');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast-notification';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Admin Form Submission Handler
if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const email = document.getElementById('adminEmail').value.trim().toLowerCase();
        const password = document.getElementById('adminPassword').value.trim();

        if (!email || !password) {
            showNotification('Please fill in both Email and Password.');
            return;
        }

        // Retrieve registered accounts from localStorage
        const registrations = JSON.parse(localStorage.getItem('registrations')) || [];

        // Authenticate: Match against registered user or fallback admin credentials
        const matchedAccount = registrations.find(user => 
            user.email === email && user.password === password
        );

        const isSystemAdmin = (email === 'admin@thinkmate.com' && password === 'admin123');

        if (matchedAccount || isSystemAdmin) {
            const adminData = matchedAccount || { name: 'Academy Admin', email: email, role: 'Administrator' };

            // Store authentication state in local & session storage
            localStorage.setItem('isAdminLoggedIn', 'true');
            sessionStorage.setItem('currentAdmin', JSON.stringify(adminData));

            showNotification('Admin Authentication Successful! ♕ Redirecting to Messages...');

            adminLoginForm.reset();
            hide();

            // Render status card
            renderAdminStatusCard();

            // Redirect to admin inbox after delay
            setTimeout(() => {
                window.location.href = 'messages.html';
            }, 1500);

        } else {
            showNotification('Invalid Admin Email or Password!');
        }
    });
}

// Render Admin Status Card inside Container
function renderAdminStatusCard() {
    if (!adminContainer) return;
    adminContainer.innerHTML = '';

    const isAdmin = localStorage.getItem('isAdminLoggedIn') === 'true';
    const currentAdmin = JSON.parse(sessionStorage.getItem('currentAdmin'));

    if (isAdmin && currentAdmin) {
        const card = document.createElement('div');
        card.classList.add('book-container');
        card.innerHTML = `
            <h2>${currentAdmin.name || 'Admin User'}</h2>
            <h5>${currentAdmin.email}</h5>
            <span class="course-detail">Administrator Status: ACTIVE</span>
            <button class="delete-btn" onclick="logoutAdmin()">Logout Admin</button>
        `;
        adminContainer.appendChild(card);
    }
}

// Admin Logout Action
function logoutAdmin() {
    localStorage.removeItem('isAdminLoggedIn');
    sessionStorage.removeItem('currentAdmin');
    showNotification('Logged out from Admin session.');
    if (adminContainer) adminContainer.innerHTML = '';
}

// Unread Badge Counter Function
function updateUnreadBadge() {
    const badge = document.getElementById('unreadBadge');
    if (!badge) return;

    const messages = JSON.parse(localStorage.getItem('userMessages')) || [];
    const unreadCount = messages.filter(msg => msg.unread === true || msg.unread === undefined).length;

    if (unreadCount > 0) {
        badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
        badge.style.display = 'inline-block';
    } else {
        badge.style.display = 'none';
    }
}