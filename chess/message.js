document.addEventListener('DOMContentLoaded', () => {
    const adminSession = JSON.parse(localStorage.getItem('currentAdminSession'));
    const userSession = JSON.parse(localStorage.getItem('currentUserSession'));

    if (!adminSession && !userSession) {
        alert('Please log in first!');
        window.location.href = 'user-login.html';
        return;
    }

    const isAdmin = !!adminSession;
    const activePlayerId = userSession ? userSession.playerId : null;

    const usersList = document.getElementById('usersList');
    const messagesList = document.getElementById('messagesList');
    const activeUserName = document.getElementById('activeUserName');
    const chatInputForm = document.getElementById('chatInputForm');
    const chatMessageInput = document.getElementById('chatMessageInput');
    const sendBtn = document.getElementById('sendBtn');
    let selectedPlayerId = null;

    // Load registered students
    const registrations = JSON.parse(localStorage.getItem('registrations')) || [];

    function getMessages() {
        return JSON.parse(localStorage.getItem('academyMessages')) || [];
    }

    function renderThreadList() {
        const allMessages = getMessages();

        if (isAdmin) {
            // ADMIN VIEW: List all registered student Player IDs
            if (registrations.length === 0) {
                usersList.innerHTML = '<div style="padding: 15px; color: #888;">No registered students found.</div>';
                return;
            }

            usersList.innerHTML = registrations.map(student => {
                const studentMsgs = allMessages.filter(m => m.playerId === student.playerId);
                const lastMsg = studentMsgs[studentMsgs.length - 1];
                const preview = lastMsg ? lastMsg.text : 'No messages yet';

                return `
                    <div class="user-item ${selectedPlayerId === student.playerId ? 'active' : ''}" 
                         onclick="selectThread('${student.playerId}', '${student.name}')"
                         style="padding: 10px; cursor: pointer; border-bottom: 1px solid #333;">
                        <strong>${student.name}</strong> (${student.playerId})
                        <div style="font-size: 12px; color: #aaa; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${preview}</div>
                    </div>
                `;
            }).join('');
        } else {
            // USER VIEW: Show user's active thread
            usersList.innerHTML = `
                <div class="user-item active" style="padding: 10px; border-bottom: 1px solid #333;">
                    <strong>♕ Academy Admin</strong>
                    <div style="font-size: 12px; color: #aaa;">Direct Thread for ${userSession.name} (${userSession.playerId})</div>
                </div>
            `;
            if (!selectedPlayerId) {
                selectThread(userSession.playerId, userSession.name);
            }
        }
    }

    window.selectThread = function(playerId, name) {
        selectedPlayerId = playerId;
        activeUserName.textContent = isAdmin ? `Chatting with: ${name} [${playerId}]` : `Support Chat (ID: ${playerId})`;
        chatMessageInput.disabled = false;
        sendBtn.disabled = false;
        renderThreadList();
        renderMessages();
    };

    function renderMessages() {
        if (!selectedPlayerId) return;

        const allMessages = getMessages();
        const studentMsgs = allMessages.filter(m => m.playerId === selectedPlayerId);

        messagesList.innerHTML = studentMsgs.map(m => {
            const isSenderAdmin = m.senderRole === 'admin';
            return `
                <div style="display: flex; flex-direction: column; align-items: ${isSenderAdmin ? (isAdmin ? 'flex-end' : 'flex-start') : (isAdmin ? 'flex-start' : 'flex-end')}; margin-bottom: 10px;">
                    <div style="font-size: 10px; color: #888; margin-bottom: 2px;">
                        ${isSenderAdmin ? '♕ Admin (' + m.senderName + ')' : '👤 ' + m.senderName} • ${m.timestamp}
                    </div>
                    <div style="background: ${isSenderAdmin ? '#d4af37' : '#2b5278'}; color: ${isSenderAdmin ? '#000' : '#fff'}; padding: 8px 14px; border-radius: 8px; max-width: 70%;">
                        ${m.text}
                    </div>
                </div>
            `;
        }).join('');

        messagesList.scrollTop = messagesList.scrollHeight;
    }

    chatInputForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = chatMessageInput.value.trim();
        if (!text || !selectedPlayerId) return;

        const allMessages = getMessages();
        const student = registrations.find(s => s.playerId === selectedPlayerId) || { name: 'Student' };

        const newMessage = {
            playerId: selectedPlayerId,
            senderRole: isAdmin ? 'admin' : 'user',
            senderName: isAdmin ? adminSession.name : userSession.name,
            text: text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        allMessages.push(newMessage);
        localStorage.setItem('academyMessages', JSON.stringify(allMessages));

        chatMessageInput.value = '';
        renderThreadList();
        renderMessages();
    });

    renderThreadList();
});
