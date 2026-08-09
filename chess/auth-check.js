// auth-check.js
(function () {
    const isLoggedIn = localStorage.getItem("isLoggedIn") || sessionStorage.getItem("isLoggedIn");

    // If user is not logged in, block access and redirect
    if (!isLoggedIn) {
        alert("Access Denied! You must register or log in first.");
        window.location.href = "register.html";
    }
})();