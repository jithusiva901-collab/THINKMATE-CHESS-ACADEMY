document.addEventListener('DOMContentLoaded', () => {
    // -------------------------------------------------------------
    // 1. Navigation Menu Dropdown Toggle
    // -------------------------------------------------------------
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');

    if (menuToggle && navMenu) {
        // Toggle menu when clicking the menu icon
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            navMenu.classList.toggle('active');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
                navMenu.classList.remove('active');
            }
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
// 3. Razorpay Payment Handler Function
// -------------------------------------------------------------
function payNow() {
    let name = document.getElementById("name") ? document.getElementById("name").value : "";
    let email = document.getElementById("email") ? document.getElementById("email").value : "";
    let phone = document.getElementById("phone") ? document.getElementById("phone").value : "";
    let amount = document.getElementById("course") ? document.getElementById("course").value : 1000;

    if (!name || !email || !phone) {
        alert("Please fill all details");
        return;
    }

    let options = {
        key: "YOUR_RAZORPAY_KEY_ID",
        amount: amount * 100,
        currency: "INR",
        name: "THINKMATE CHESS ACADEMY ♕",
        description: "Course Registration",
        handler: function(response) {
            alert("Payment Successful!\nPayment ID: " + response.razorpay_payment_id);
            const regForm = document.getElementById("registrationForm");
            if (regForm) regForm.reset();
        },
        prefill: {
            name: name,
            email: email,
            contact: phone
        },
        theme: {
            color: "#a5905c"
        }
    };

    let rzp = new Razorpay(options);
    rzp.open();
}
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