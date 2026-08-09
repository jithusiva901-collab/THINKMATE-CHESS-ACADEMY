document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('adminRegisterForm');
    const nameInput = document.getElementById('adminName');
    const emailInput = document.getElementById('adminEmail');
    const mobileInput = document.getElementById('adminMobile');
    const passwordInput = document.getElementById('adminPassword');
    const togglePasswordBtn = document.getElementById('togglePasswordBtn');
    const alertBox = document.getElementById('alertBox');

    // Toggle Password Visibility
    togglePasswordBtn.addEventListener('click', () => {
        const isPassword = passwordInput.type === 'password';
        passwordInput.type = isPassword ? 'text' : 'password';
        togglePasswordBtn.textContent = isPassword ? '🙈' : '👁';
    });

    // Helper function to display alerts inside the card
    function showAlert(message, type = 'error') {
        alertBox.textContent = message;
        alertBox.className = `alert-box ${type}`;
        alertBox.style.display = 'block';
    }

    // Form Submission Handler
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        alertBox.style.display = 'none';

        const name = nameInput.value.trim();
        const email = emailInput.value.trim().toLowerCase();
        const mobile = mobileInput.value.trim();
        const password = passwordInput.value.trim();

        // Basic Validation Checks
        if (!name || !email || !mobile || !password) {
            showAlert('Please complete all fields.', 'error');
            return;
        }

        if (mobile.length !== 10 || isNaN(mobile)) {
            showAlert('Please provide a valid 10-digit mobile number.', 'error');
            return;
        }

        if (password.length < 6) {
            showAlert('Password must be at least 6 characters long.', 'error');
            return;
        }

        // Check LocalStorage for Duplicate Admin
        let registeredAdmins = JSON.parse(localStorage.getItem('registeredAdmins')) || [];

        if (registeredAdmins.some(admin => admin.email.toLowerCase() === email)) {
            showAlert('An admin account with this email address already exists.', 'error');
            return;
        }

        // Store Admin Details
        const newAdmin = {
            name: name,
            email: email,
            mobile: mobile,
            password: password,
            role: 'admin',
            createdAt: new Date().toLocaleDateString()
        };

        registeredAdmins.push(newAdmin);
        localStorage.setItem('registeredAdmins', JSON.stringify(registeredAdmins));

        showAlert(`Admin account created for ${name}! Redirecting to login...`, 'success');

        setTimeout(() => {
            window.location.href = 'admin-login.html';
        }, 1500);
    });
});