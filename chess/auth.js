// Tab Switching Handler
function switchAuthMode(mode) {
    const userForm = document.getElementById('userForm');
    const adminLoginForm = document.getElementById('adminLoginForm');
    const adminRegForm = document.getElementById('adminRegForm');
    
    const userTabBtn = document.getElementById('userTabBtn');
    const adminLoginTabBtn = document.getElementById('adminLoginTabBtn');
    const adminRegTabBtn = document.getElementById('adminRegTabBtn');

    // Hide all forms initially
    userForm.classList.add('hidden-form');
    adminLoginForm.classList.add('hidden-form');
    adminRegForm.classList.add('hidden-form');

    // Reset button states
    userTabBtn.className = 'btn btn-secondary';
    adminLoginTabBtn.className = 'btn btn-secondary';
    adminRegTabBtn.className = 'btn btn-secondary';

    if (mode === 'admin-login') {
        adminLoginForm.classList.remove('hidden-form');
        adminLoginTabBtn.className = 'btn btn-primary';
    } else if (mode === 'admin-reg') {
        adminRegForm.classList.remove('hidden-form');
        adminRegTabBtn.className = 'btn btn-primary';
    } else {
        userForm.classList.remove('hidden-form');
        userTabBtn.className = 'btn btn-primary';
    }
}

// 1. REGISTER NEW ADMIN (Saved directly into register page storage)
document.getElementById('adminRegForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('adminRegName').value.trim();
    const username = document.getElementById('adminRegEmail').value.trim();
    const password = document.getElementById('adminRegPassword').value.trim();
    const secretKey = document.getElementById('adminSecretKey').value.trim();
    const regError = document.getElementById('adminRegError');

    // Verification token check
    if (secretKey !== 'ADMIN123') {
        regError.textContent = 'Invalid Passkey! Only authorized admins can register new admin accounts.';
        regError.classList.remove('hidden-form');
        return;
    }

    // Retrieve existing saved admin users
    const adminUsers = JSON.parse(localStorage.getItem('adminUsers')) || [];

    // Check duplicate registrations
    const exists = adminUsers.some(a => a.username.toLowerCase() === username.toLowerCase());
    if (exists) {
        alert('This Admin ID/Email is already registered!');
        return;
    }

    // Save newly created admin details
    adminUsers.push({
        name: name,
        username: username,
        password: password,
        createdDate: new Date().toLocaleDateString()
    });

    localStorage.setItem('adminUsers', JSON.stringify(adminUsers));

    alert('Admin account created successfully! You can now log in.');
    switchAuthMode('admin-login');
});

// 2. ADMIN LOGIN VERIFICATION
document.getElementById('adminLoginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const username = document.getElementById('adminLoginUsername').value.trim();
    const password = document.getElementById('adminLoginPassword').value.trim();
    const loginError = document.getElementById('adminLoginError');

    // Get stored admins (with default fallback)
    const adminUsers = JSON.parse(localStorage.getItem('adminUsers')) || [
        { username: 'admin', password: 'admin123', name: 'Master Admin' }
    ];

    // Authenticate credentials against stored register data
    const matchedAdmin = adminUsers.find(
        a => a.username.toLowerCase() === username.toLowerCase() && a.password === password
    );

    if (matchedAdmin) {
        localStorage.setItem('isAdminLoggedIn', 'true');
        localStorage.setItem('activeAdminName', matchedAdmin.name || matchedAdmin.username);
        alert(`Welcome, Admin ${matchedAdmin.name || matchedAdmin.username}! Redirecting...`);
        window.location.href = 'admin-dashboard.html';
    } else {
        loginError.classList.remove('hidden-form');
    }
});

// 3. STANDARD USER ACCESS HANDLER
document.getElementById('userForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const userName = document.getElementById('userName').value.trim();
    const userEmail = document.getElementById('userEmail').value.trim();

    // Store active logged-in user
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('currentUser', JSON.stringify({ name: userName, email: userEmail }));
    
    alert(`Welcome, ${userName}!`);
    window.location.href = 'home.html';
});