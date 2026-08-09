const loginForm = document.getElementById('loginForm');

// Helper function to display toast notifications
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

loginForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const inputEmail = document.getElementById('loginEmail').value.trim().toLowerCase();
    const inputPassword = document.getElementById('loginPassword').value.trim();

    // 1. Check if input fields are filled
    if (!inputEmail || !inputPassword) {
        showNotification('Please enter both Email Address and Password.');
        return;
    }

    // 2. Fetch all registered users from LocalStorage
    const registrations = JSON.parse(localStorage.getItem('registrations')) || [];

    // 3. Check if any registered user matches BOTH email and password
    const registeredUser = registrations.find(
        user => user.email === inputEmail && user.password === inputPassword
    );

    // 4. Validate registration status
    if (!registeredUser) {
        showNotification('Account not found! You must register before logging in.');
        return;
    }

    // 5. Successful login: Save session & redirect
    sessionStorage.setItem('isLoggedIn', 'true');
    sessionStorage.setItem('currentUser', JSON.stringify(registeredUser));

    showNotification(`Welcome back, ${registeredUser.name}! Login successful. ♕`);

    // Redirect to home page after 1.5 seconds
    setTimeout(() => {
        window.location.href = 'home.html';
    }, 1500);
});

