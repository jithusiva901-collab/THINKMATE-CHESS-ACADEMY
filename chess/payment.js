document.addEventListener('DOMContentLoaded', () => {
    // -------------------------------------------------------------
    // 1. Navigation Menu Dropdown Toggle
    // -------------------------------------------------------------
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

    // -------------------------------------------------------------
    // 2. Load Saved Registrations
    // -------------------------------------------------------------
    loadRegistrations();

    // -------------------------------------------------------------
    // 3. Logout Handler
    // -------------------------------------------------------------
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function (e) {
            e.preventDefault();
            sessionStorage.removeItem('isLoggedIn');
            localStorage.removeItem('isLoggedIn');
            window.location.href = 'login.html';
        });
    }
});

// Selecting DOM Elements
const addButton = document.getElementById('add-popup-button');
const overlay = document.querySelector('.overlay');
const popupBox = document.querySelector('.popupbox');
const cancelButton = document.getElementById('cancel-popup');
const registrationForm = document.getElementById('registrationForm');
const container = document.querySelector('.container');

// Show Popup Modal & Overlay
function show() {
    overlay.style.display = 'block';
    popupBox.style.display = 'block';
}

// Hide Popup Modal & Overlay
function hide() {
    overlay.style.display = 'none';
    popupBox.style.display = 'none';
}

// Event Listeners for Modal
if (addButton) addButton.addEventListener('click', show);
if (cancelButton) cancelButton.addEventListener('click', hide);
if (overlay) overlay.addEventListener('click', hide);

// Toast Notification Helper Function
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

// Registration Form Handler
if (registrationForm) {
    registrationForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim().toLowerCase();
        const phone = document.getElementById('phone').value.trim();
        const password = document.getElementById('password').value.trim();
        const courseSelect = document.getElementById('course');
        const courseText = courseSelect.options[courseSelect.selectedIndex].text;

        if (!name || !email || !phone || !password) {
            showNotification('Please fill in all fields including password.');
            return;
        }

        const registrations = JSON.parse(localStorage.getItem('registrations')) || [];
        const existingUser = registrations.find(user => user.email === email);

        if (existingUser) {
            showNotification('This email is already registered! Please login instead.');
            return;
        }

        const id = Date.now().toString();

        saveRegistrationToStorage(id, name, email, phone, password, courseText);
        createCard(id, name, email, phone, courseText);

        registrationForm.reset();
        hide();

        showNotification('Registration successful! You can now log in. ♕');
    });
}

// Render dynamic card element
function createCard(id, name, email, phone, course) {
    const card = document.createElement('div');
    card.classList.add('book-container');
    card.setAttribute('data-id', id);
    card.innerHTML = `
        <h2>${name}</h2>
        <h5>${email}</h5>
        <p class="phone-number">${phone}</p>
        <span class="course-detail">${course}</span>
        <button class="delete-btn">Delete</button>
    `;
    container.appendChild(card);
}

// Delete Registration Logic
if (container) {
    container.addEventListener('click', function (e) {
        if (e.target.classList.contains('delete-btn')) {
            const userConfirmed = confirm('Are you sure you want to delete this registration account?');
            if (userConfirmed) {
                const card = e.target.closest('.book-container');
                const id = card.getAttribute('data-id');

                card.remove();
                removeRegistrationFromStorage(id);
                showNotification('Registration account deleted.');
            }
        }
    });
}

// Local Storage Helpers
function saveRegistrationToStorage(id, name, email, phone, password, course) {
    const registrations = JSON.parse(localStorage.getItem('registrations')) || [];
    registrations.push({ id, name, email, phone, password, course });
    localStorage.setItem('registrations', JSON.stringify(registrations));
}

function loadRegistrations() {
    if (!container) return;
    container.innerHTML = '';
    const registrations = JSON.parse(localStorage.getItem('registrations')) || [];

    registrations.forEach(reg => {
        if (reg.name && reg.email) {
            createCard(reg.id || Date.now(), reg.name, reg.email, reg.phone, reg.course);
        }
    });
}

function removeRegistrationFromStorage(id) {
    let registrations = JSON.parse(localStorage.getItem('registrations')) || [];
    registrations = registrations.filter(reg => reg.id !== id);
    localStorage.setItem('registrations', JSON.stringify(registrations));
}
// Inside payment.js (Registration Form Submit Handler)
registrationForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim().toLowerCase();
    const phone = document.getElementById('phone').value.trim();
    const password = document.getElementById('password').value.trim();
    const courseSelect = document.getElementById('course');
    const courseText = courseSelect.options[courseSelect.selectedIndex].text;

    if (!name || !email || !phone || !password) {
        showNotification('Please fill in all required fields.');
        return;
    }

    // 1. Save account to registrations array
    const registrations = JSON.parse(localStorage.getItem('registrations')) || [];
    const newUser = { id: Date.now().toString(), name, email, phone, password, course: courseText };
    registrations.push(newUser);
    localStorage.setItem('registrations', JSON.stringify(registrations));

    // 2. Grant access authorization
    localStorage.setItem('isLoggedIn', 'true');
    sessionStorage.setItem('currentUser', JSON.stringify(newUser));

    showNotification('Registration successful! Redirecting...');

    // 3. Redirect to protected area
    setTimeout(() => {
        window.location.href = 'home.html';
    }, 1500);
});
// Logout listener in payment.js / login.js / review.js
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
    logoutBtn.addEventListener("click", function (e) {
        e.preventDefault();
        localStorage.removeItem("isLoggedIn");
        sessionStorage.removeItem("isLoggedIn");
        sessionStorage.removeItem("currentUser");
        window.location.href = "register.html";
    });
}
// Inside payment.js (registrationForm submit handler)
registrationForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim().toLowerCase();
    const phone = document.getElementById('phone').value.trim();
    const password = document.getElementById('password').value.trim();
    const courseSelect = document.getElementById('course');
    const courseText = courseSelect.options[courseSelect.selectedIndex].text;

    if (!name || !email || !phone || !password) {
    showNotification('Registration successful! Directing to Academy Home... ♕');
        return;
    }

    // Save account to registrations array
    const registrations = JSON.parse(localStorage.getItem('registrations')) || [];
    const newUser = { id: Date.now().toString(), name, email, phone, password, course: courseText };
    registrations.push(newUser);
    localStorage.setItem('registrations', JSON.stringify(registrations));

    // GRANT ACCESS: Set login status in localStorage
    localStorage.setItem('isLoggedIn', 'true');
    sessionStorage.setItem('currentUser', JSON.stringify(newUser));

    showNotification('Registration successful! Directing to Academy Home... ♕');

    // Redirect user to home page after 1.5 seconds
    setTimeout(() => {
        window.location.href = 'home.html';
    }, 1500);
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