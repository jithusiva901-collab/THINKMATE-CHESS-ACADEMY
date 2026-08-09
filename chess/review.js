// Selecting DOM elements
const popupoverlay = document.querySelector(".overlay");
const popupbox = document.querySelector(".popupbox");
const container = document.querySelector(".container");
const cancelpopup = document.getElementById("cancel-popup");
const addbook = document.getElementById("add-book");
const booktitleinput = document.getElementById("book-title-input");
const bookdescriptioninput = document.getElementById("book-description-input");

// Load saved reviews & initialize menu handlers on page load
document.addEventListener("DOMContentLoaded", function () {
    loadReviews();

    // Menu Icon Toggle Handler
    const menuToggle = document.getElementById("menuToggle");
    const navMenu = document.getElementById("navMenu");

    if (menuToggle && navMenu) {
        menuToggle.addEventListener("click", function (e) {
            e.stopPropagation();
            navMenu.classList.toggle("active");
        });

        // Close dropdown when clicking anywhere outside
        document.addEventListener("click", function (e) {
            if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
                navMenu.classList.remove("active");
            }
        });
    }

    // Logout Handler
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", function (e) {
            e.preventDefault();
            sessionStorage.removeItem("isLoggedIn");
            localStorage.removeItem("isLoggedIn");
            window.location.href = "login.html";
        });
    }
});

// Show popup modal & overlay
function show() {
    popupbox.style.display = "flex";
    popupoverlay.style.display = "block";
}

// Close popup modal & overlay
function closepopup() {
    popupbox.style.display = "none";
    popupoverlay.style.display = "none";
}

// Close popup on Cancel click
cancelpopup.addEventListener("click", function (event) {
    event.preventDefault();
    closepopup();
});

// Close popup on background overlay click
popupoverlay.addEventListener("click", closepopup);

// Toast notification helper
function showNotification(message) {
    let toast = document.getElementById("toast-notification");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "toast-notification";
        toast.className = "toast";
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(function () {
        toast.classList.remove("show");
    }, 3000);
}

// Add Review button handler
addbook.addEventListener("click", function (event) {
    event.preventDefault();

    const title = booktitleinput.value.trim();
    const desc = bookdescriptioninput.value.trim();

    // Validation
    if (!title || !desc) {
        alert("Please enter both your name and review.");
        return;
    }

    // Generate unique ID for safe deletion
    const id = Date.now().toString();

    // Render review card on the DOM
    createReviewCard(id, title, desc);

    // Save to LocalStorage
    saveReviewToStorage(id, title, desc);

    // Reset form and close modal
    booktitleinput.value = "";
    bookdescriptioninput.value = "";
    closepopup();

    // Show success notification
    showNotification("Review submitted successfully! ♕");
});

// Render a single review card
function createReviewCard(id, title, description) {
    if (!title || !description) return;

    const card = document.createElement("div");
    card.className = "book-container";
    card.setAttribute("data-id", id);
    card.innerHTML = `
        <h3>STUDENTS REVIEW</h3>
        <h5>${title}</h5>
        <p>${description}</p>
        <button onclick="deletbook(event)">Delete</button>
    `;
    container.appendChild(card);
}

// Delete review function
function deletbook(event) {
    const userConfirmed = confirm("Are you sure you want to delete this review?");
    if (!userConfirmed) return;

    const card = event.target.closest(".book-container");
    const id = card.getAttribute("data-id");

    card.remove();
    removeReviewFromStorage(id);
    showNotification("Review deleted successfully.");
}

// ==========================================
// LOCAL STORAGE FUNCTIONS
// ==========================================

function saveReviewToStorage(id, title, description) {
    const reviews = JSON.parse(localStorage.getItem("reviews")) || [];
    reviews.push({ id: id, title: title, description: description });
    localStorage.setItem("reviews", JSON.stringify(reviews));
}

function loadReviews() {
    container.innerHTML = "";
    const reviews = JSON.parse(localStorage.getItem("reviews")) || [];

    reviews.forEach(function (review) {
        if (review.title && review.description) {
            createReviewCard(review.id || Date.now(), review.title, review.description);
        }
    });
}

function removeReviewFromStorage(id) {
    let reviews = JSON.parse(localStorage.getItem("reviews")) || [];
    reviews = reviews.filter(function (review) {
        return review.id !== id;
    });
    localStorage.setItem("reviews", JSON.stringify(reviews));
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