document.addEventListener('DOMContentLoaded', () => {
    // 1. Inject Chat Widget HTML into the DOM
    const widgetHTML = `
        <div class="chat-widget">
            <button class="chat-toggle-btn" id="chatToggleBtn">💬 Messages</button>
            
            <div class="chat-popup" id="chatPopup">
                <div class="chat-header">
                    <span>Send Us a Message</span>
                    <button class="chat-close-btn" id="chatCloseBtn">&times;</button>
                </div>
                <form id="widgetContactForm" class="chat-body">
                    <input type="text" id="widgetName" placeholder="Your Name" required>
                    <input type="email" id="widgetEmail" placeholder="Your Email" required>
                    <input type="tel" id="widgetPhone" placeholder="Your Phone Number" required>
                    <textarea id="widgetMessage" rows="3" placeholder="Type your message..." required></textarea>
                    <button type="submit" class="widget-send-btn">Send Message</button>
                </form>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', widgetHTML);

    // 2. DOM Elements
    const chatToggleBtn = document.getElementById('chatToggleBtn');
    const chatPopup = document.getElementById('chatPopup');
    const chatCloseBtn = document.getElementById('chatCloseBtn');
    const widgetContactForm = document.getElementById('widgetContactForm');

    // 3. Toggle & Close Popup
    if (chatToggleBtn && chatPopup) {
        chatToggleBtn.addEventListener('click', () => {
            chatPopup.classList.toggle('active');
        });
    }

    if (chatCloseBtn && chatPopup) {
        chatCloseBtn.addEventListener('click', () => {
            chatPopup.classList.remove('active');
        });
    }

    // 4. Form Submission Handler
    if (widgetContactForm) {
        widgetContactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('widgetName').value.trim();
            const email = document.getElementById('widgetEmail').value.trim();
            const phone = document.getElementById('widgetPhone').value.trim();
            const message = document.getElementById('widgetMessage').value.trim();

            if (!name || !email || !phone || !message) return;

            const newMessage = {
                id: Date.now().toString(),
                name,
                email,
                phone,
                message,
                timestamp: new Date().toLocaleString()
            };

            const existingMessages = JSON.parse(localStorage.getItem('userMessages')) || [];
            existingMessages.push(newMessage);
            localStorage.setItem('userMessages', JSON.stringify(existingMessages));

            widgetContactForm.reset();
            chatPopup.classList.remove('active');
            alert('Message sent successfully! ♕');
        });
    }
});
// Global toggle function for button onclick handlers
function toggleChatPopup(show) {
    const chatPopup = document.getElementById('chatPopup');
    if (chatPopup) {
        if (typeof show === 'boolean') {
            chatPopup.style.display = show ? 'block' : 'none';
        } else {
            // Toggle display state if no boolean argument passed
            chatPopup.style.display = (chatPopup.style.display === 'block') ? 'none' : 'block';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // 1. Toggle Button Handlers
    const chatToggleBtn = document.getElementById('chatToggleBtn');
    const chatCloseBtn = document.getElementById('chatCloseBtn');

    if (chatToggleBtn) {
        chatToggleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            toggleChatPopup(true);
        });
    }

    if (chatCloseBtn) {
        chatCloseBtn.addEventListener('click', (e) => {
            e.preventDefault();
            toggleChatPopup(false);
        });
    }

    // 2. Form Submission Handler
    const widgetContactForm = document.getElementById('widgetContactForm');
    if (widgetContactForm) {
        widgetContactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('widgetName').value.trim();
            const email = document.getElementById('widgetEmail').value.trim();
            const phone = document.getElementById('widgetPhone').value.trim();
            const message = document.getElementById('widgetMessage').value.trim();

            if (!name || !email || !message) {
                alert('Please fill in all required fields.');
                return;
            }

            // Save message to localStorage for Admin Inbox / Messages page
            const academyMessages = JSON.parse(localStorage.getItem('academyMessages')) || [];
            academyMessages.push({
                id: Date.now(),
                name: name,
                email: email,
                phone: phone,
                message: message,
                date: new Date().toLocaleDateString()
            });

            localStorage.setItem('academyMessages', JSON.stringify(academyMessages));

            // Update badge count if present on the page
            const unreadBadge = document.getElementById('unreadBadge');
            if (unreadBadge) {
                unreadBadge.textContent = academyMessages.length;
            }

            alert(`Thank you, ${name}! Your message has been sent successfully.`);
            widgetContactForm.reset();
            toggleChatPopup(false);
        });
    }
});