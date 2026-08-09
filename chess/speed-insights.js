// Initialize Vercel Speed Insights for vanilla HTML/JS
(function() {
    // Create the Speed Insights initialization script
    window.si = window.si || function () { 
        (window.siq = window.siq || []).push(arguments); 
    };
    
    // Load the Speed Insights script
    var script = document.createElement('script');
    script.defer = true;
    script.src = '/_vercel/speed-insights/script.js';
    document.head.appendChild(script);
})();
