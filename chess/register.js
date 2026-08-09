document.addEventListener('DOMContentLoaded', () => {
    // 1. Modal Toggle Handlers
    const addButton = document.getElementById('add-popup-button');
    const overlay = document.querySelector('.overlay');
    const popupBox = document.querySelector('.popupbox');
    const cancelButton = document.getElementById('cancel-popup');

    function showModal() {
        if (overlay && popupBox) {
            overlay.style.display = 'block';
            popupBox.style.display = 'block';
            
            // Auto-generate a fresh Player ID in the input field when opening
            const playerIdInput = document.getElementById('studentPlayerId');
            if (playerIdInput && !playerIdInput.value) {
                playerIdInput.value = 'TM-' + Math.floor(1000 + Math.random() * 9000);
            }
        }
    }

    function hideModal() {
        if (overlay && popupBox) {
            overlay.style.display = 'none';
            popupBox.style.display = 'none';
        }
    }

    if (addButton) addButton.addEventListener('click', showModal);
    if (cancelButton) cancelButton.addEventListener('click', hideModal);
    if (overlay) overlay.addEventListener('click', hideModal);

    // 2. Render Existing Containers
    renderRegisteredStudents();

    // 3. Form Submit Handler
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const playerId = document.getElementById('studentPlayerId').value.trim();
            const name = document.getElementById('studentName').value.trim();
            const email = document.getElementById('studentEmail').value.trim().toLowerCase();
            const course = document.getElementById('studentCourse').value;
            const password = document.getElementById('studentPassword').value;

            const registrations = JSON.parse(localStorage.getItem('registrations')) || [];

            // Check if Player ID or Email already exists
            if (registrations.some(u => u.playerId === playerId)) {
                alert('This Player ID already exists! Please use a unique ID.');
                return;
            }
            if (registrations.some(u => u.email === email)) {
                alert('This email is already registered!');
                return;
            }

            // Create New Student Record with all container details
            const newStudent = {
                playerId: playerId,
                name: name,
                email: email,
                course: course,
                password: password,
                perf: {
                    rating: 1200,
                    wins: 0,
                    losses: 0,
                    draws: 0
                }
            };

            registrations.push(newStudent);
            localStorage.setItem('registrations', JSON.stringify(registrations));

            alert(`Student successfully registered!\nPlayer ID: ${playerId}`);
            
            registerForm.reset();
            hideModal();
            renderRegisteredStudents();
        });
    }
});

// Render Containers with All Registered Details
function renderRegisteredStudents() {
    const container = document.getElementById('studentContainer') || document.querySelector('.container');
    if (!container) return;

    container.innerHTML = '';
    const registrations = JSON.parse(localStorage.getItem('registrations')) || [];

    if (registrations.length === 0) {
        container.innerHTML = '<p style="color: #ccc; text-align: center; grid-column: 1/-1;">No registered students found.</p>';
        return;
    }

    registrations.forEach((user, index) => {
        user.perf = user.perf || { rating: 1200, wins: 0, losses: 0, draws: 0 };
        const totalGames = user.perf.wins + user.perf.losses + user.perf.draws;
        const winRate = totalGames > 0 ? Math.round((user.perf.wins / totalGames) * 100) : 0;

        const card = document.createElement('div');
        card.className = 'book-container';

        // Container displaying all filled details: Name, Player ID, Email, Course, Rating, Performance
        card.innerHTML = `
            <h2>${user.name}</h2>
            <div style="background: rgba(212, 175, 55, 0.15); border: 1px solid #d4af37; padding: 4px 10px; border-radius: 6px; display: inline-block; margin-bottom: 8px;">
                <strong style="color: #d4af37;">Player ID:</strong> <span style="color: #fff; font-family: monospace; font-size: 15px;">${user.playerId}</span>
            </div>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Course:</strong> ${user.course}</p>
            
            <!-- Performance Tracker in Container -->
            <div class="perf-tracker" style="background: rgba(0,0,0,0.4); border: 1px solid #444; border-radius: 8px; padding: 10px; margin: 10px 0; text-align: left;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <span style="color: #d4af37; font-weight: bold; font-size: 13px;">Rating</span>
                    <span style="background: #d4af37; color: #000; font-weight: bold; padding: 2px 8px; border-radius: 10px; font-size: 12px;">${user.perf.rating} ELO</span>
                </div>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 5px; text-align: center; font-size: 12px;">
                    <div style="background: rgba(255,255,255,0.05); padding: 4px; border-radius: 4px;">W: <strong>${user.perf.wins}</strong></div>
                    <div style="background: rgba(255,255,255,0.05); padding: 4px; border-radius: 4px;">L: <strong>${user.perf.losses}</strong></div>
                    <div style="background: rgba(255,255,255,0.05); padding: 4px; border-radius: 4px;">D: <strong>${user.perf.draws}</strong></div>
                </div>
                <div style="margin-top: 6px; font-size: 11px; color: #aaa;">Win Rate: ${winRate}%</div>
            </div>

            <!-- Action Buttons -->
            <button class="play-btn" onclick="startMatchWithPlayer('${user.playerId}')" style="width: 100%; background: #d4af37; color: #000; font-weight: bold; border: none; padding: 10px; border-radius: 5px; cursor: pointer; margin-bottom: 8px;">
                ♟ Play Chess with ${user.name}
            </button>
            <button class="delete-btn" onclick="deleteStudent(${index})" style="width: 100%; background: #c62828; color: #fff; border: none; padding: 6px; border-radius: 5px; cursor: pointer;">
                Delete Container
            </button>
        `;

        container.appendChild(card);
    });
}

function deleteStudent(index) {
    const registrations = JSON.parse(localStorage.getItem('registrations')) || [];
    registrations.splice(index, 1);
    localStorage.setItem('registrations', JSON.stringify(registrations));
    renderRegisteredStudents();
}

// Render Registered Students with Player ID & Match Launcher
function renderRegisteredStudents() {
    const container = document.getElementById('studentContainer') || document.querySelector('.container');
    if (!container) return;

    container.innerHTML = '';
    const registrations = JSON.parse(localStorage.getItem('registrations')) || [];

    if (registrations.length === 0) {
        container.innerHTML = '<p style="color: #ccc; text-align: center; grid-column: 1/-1;">No registered students found.</p>';
        return;
    }

    registrations.forEach((user, index) => {
        user.perf = user.perf || { rating: 1200, wins: 0, losses: 0, draws: 0 };
        const totalGames = user.perf.wins + user.perf.losses + user.perf.draws;
        const winRate = totalGames > 0 ? Math.round((user.perf.wins / totalGames) * 100) : 0;

        const card = document.createElement('div');
        card.className = 'book-container';

        card.innerHTML = `
            <h2>${user.name}</h2>
            <div style="background: rgba(212, 175, 55, 0.15); border: 1px solid #d4af37; padding: 4px 10px; border-radius: 6px; display: inline-block; margin-bottom: 8px;">
                <strong style="color: #d4af37;">Player ID:</strong> <span style="color: #fff; font-family: monospace; font-size: 15px;">${user.playerId}</span>
            </div>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Course:</strong> ${user.course}</p>
            
            <!-- Performance Section -->
            <div class="perf-tracker" style="background: rgba(0,0,0,0.4); border: 1px solid #444; border-radius: 8px; padding: 10px; margin: 10px 0; text-align: left;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <span style="color: #d4af37; font-weight: bold; font-size: 13px;">Rating</span>
                    <span style="background: #d4af37; color: #000; font-weight: bold; padding: 2px 8px; border-radius: 10px; font-size: 12px;">${user.perf.rating} ELO</span>
                </div>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 5px; text-align: center; font-size: 12px;">
                    <div style="background: rgba(255,255,255,0.05); padding: 4px; border-radius: 4px;">W: <strong>${user.perf.wins}</strong></div>
                    <div style="background: rgba(255,255,255,0.05); padding: 4px; border-radius: 4px;">L: <strong>${user.perf.losses}</strong></div>
                    <div style="background: rgba(255,255,255,0.05); padding: 4px; border-radius: 4px;">D: <strong>${user.perf.draws}</strong></div>
                </div>
                <div style="margin-top: 6px; font-size: 11px; color: #aaa;">Win Rate: ${winRate}%</div>
            </div>

            <!-- Match Button -->
            <button class="play-btn" onclick="openPvPMatchModal('${user.playerId}')" style="width: 100%; background: #d4af37; color: #000; font-weight: bold; border: none; padding: 10px; border-radius: 5px; cursor: pointer; margin-bottom: 8px;">
                ♟ Challenge / Play vs Player
            </button>
            <button class="delete-btn" onclick="deleteStudent(${index})" style="width: 100%; background: #c62828; color: #fff; border: none; padding: 6px; border-radius: 5px; cursor: pointer;">
                Delete Container
            </button>
        `;

        container.appendChild(card);
    });
}

let pvpBoard = null;
let pvpGame = null;

function openPvPMatchModal(selectedPlayerId) {
    const modal = document.getElementById('pvpChessModal');
    const whiteSelect = document.getElementById('whitePlayerSelect');
    const blackSelect = document.getElementById('blackPlayerSelect');

    const registrations = JSON.parse(localStorage.getItem('registrations')) || [];

    if (registrations.length < 2) {
        alert('You need at least 2 registered players to start a Player vs Player match!');
        return;
    }

    // Populate Player Dropdowns
    whiteSelect.innerHTML = '';
    blackSelect.innerHTML = '';

    registrations.forEach(user => {
        const optW = document.createElement('option');
        optW.value = user.playerId;
        optW.textContent = `${user.name} (${user.playerId})`;

        const optB = document.createElement('option');
        optB.value = user.playerId;
        optB.textContent = `${user.name} (${user.playerId})`;

        whiteSelect.appendChild(optW);
        blackSelect.appendChild(optB);
    });

    // Pre-select clicked player as White, and pick a different registered player as Black
    whiteSelect.value = selectedPlayerId;
    const opponent = registrations.find(u => u.playerId !== selectedPlayerId);
    if (opponent) blackSelect.value = opponent.playerId;

    if (modal) {
        modal.style.display = 'flex';
        setTimeout(() => {
            initPvPGame();
        }, 100);
    }
}

function initPvPGame() {
    if (typeof Chess === 'undefined' || typeof Chessboard === 'undefined') return;

    pvpGame = new Chess();

    const config = {
        draggable: true,
        position: 'start',
        onDragStart: (source, piece) => {
            const whiteId = document.getElementById('whitePlayerSelect').value;
            const blackId = document.getElementById('blackPlayerSelect').value;

            if (whiteId === blackId) {
                alert('Please select two DIFFERENT registered players!');
                return false;
            }

            if (pvpGame.game_over()) return false;
        },
        onDrop: (source, target) => {
            const move = pvpGame.move({ from: source, to: target, promotion: 'q' });
            if (move === null) return 'snapback';
            
            updatePvPStatus();
            checkPvPGameOver();
        },
        onSnapEnd: () => {
            pvpBoard.position(pvpGame.fen());
        },
        pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png'
    };

    pvpBoard = Chessboard('pvpBoard', config);
    updatePvPStatus();
}

function updatePvPStatus() {
    const statusEl = document.getElementById('pvpGameStatus');
    const whiteId = document.getElementById('whitePlayerSelect').value;
    const blackId = document.getElementById('blackPlayerSelect').value;

    const registrations = JSON.parse(localStorage.getItem('registrations')) || [];
    const p1 = registrations.find(u => u.playerId === whiteId);
    const p2 = registrations.find(u => u.playerId === blackId);

    const p1Name = p1 ? p1.name : 'Player 1';
    const p2Name = p2 ? p2.name : 'Player 2';

    if (!statusEl) return;

    if (pvpGame.in_checkmate()) {
        statusEl.textContent = 'Checkmate! Game Over.';
    } else if (pvpGame.in_draw()) {
        statusEl.textContent = 'Game Drawn!';
    } else {
        const turnPlayer = pvpGame.turn() === 'w' ? `${p1Name} (White)` : `${p2Name} (Black)`;
        statusEl.textContent = `Current Turn: ${turnPlayer}${pvpGame.in_check() ? ' - IN CHECK!' : ''}`;
    }
}

function checkPvPGameOver() {
    if (!pvpGame.game_over()) return;

    const whiteId = document.getElementById('whitePlayerSelect').value;
    const blackId = document.getElementById('blackPlayerSelect').value;

    const registrations = JSON.parse(localStorage.getItem('registrations')) || [];
    const p1Index = registrations.findIndex(u => u.playerId === whiteId);
    const p2Index = registrations.findIndex(u => u.playerId === blackId);

    if (p1Index === -1 || p2Index === -1 || p1Index === p2Index) return;

    const p1 = registrations[p1Index];
    const p2 = registrations[p2Index];

    p1.perf = p1.perf || { rating: 1200, wins: 0, losses: 0, draws: 0 };
    p2.perf = p2.perf || { rating: 1200, wins: 0, losses: 0, draws: 0 };

    if (pvpGame.in_checkmate()) {
        const winnerColor = pvpGame.turn() === 'w' ? 'black' : 'white';

        if (winnerColor === 'white') {
            // White Player Won
            p1.perf.wins += 1;
            p1.perf.rating += 15;
            p2.perf.losses += 1;
            p2.perf.rating = Math.max(800, p2.perf.rating - 10);
            alert(`🎉 ${p1.name} (White) defeated ${p2.name} (Black)! Stats Updated.`);
        } else {
            // Black Player Won
            p2.perf.wins += 1;
            p2.perf.rating += 15;
            p1.perf.losses += 1;
            p1.perf.rating = Math.max(800, p1.perf.rating - 10);
            alert(`🎉 ${p2.name} (Black) defeated ${p1.name} (White)! Stats Updated.`);
        }
    } else if (pvpGame.in_draw()) {
        p1.perf.draws += 1;
        p1.perf.rating += 2;
        p2.perf.draws += 1;
        p2.perf.rating += 2;
        alert(`Draw recorded between ${p1.name} and ${p2.name}.`);
    }

    localStorage.setItem('registrations', JSON.stringify(registrations));
    renderRegisteredStudents();
}

// Event Listeners for PvP Controls
document.addEventListener('DOMContentLoaded', () => {
    const closePvpModal = document.getElementById('closePvpModal');
    const closePvpBtn = document.getElementById('closePvpBtn');
    const resetPvpBoardBtn = document.getElementById('resetPvpBoardBtn');
    const whiteSelect = document.getElementById('whitePlayerSelect');
    const blackSelect = document.getElementById('blackPlayerSelect');

    const closeModalFunc = () => {
        document.getElementById('pvpChessModal').style.display = 'none';
    };

    if (closePvpModal) closePvpModal.addEventListener('click', closeModalFunc);
    if (closePvpBtn) closePvpBtn.addEventListener('click', closeModalFunc);

    if (resetPvpBoardBtn) {
        resetPvpBoardBtn.addEventListener('click', () => {
            if (pvpGame && pvpBoard) {
                pvpGame.reset();
                pvpBoard.start();
                updatePvPStatus();
            }
        });
    }

    if (whiteSelect) {
        whiteSelect.addEventListener('change', () => {
            if (pvpGame) pvpGame.reset();
            if (pvpBoard) pvpBoard.start();
            updatePvPStatus();
        });
    }

    if (blackSelect) {
        blackSelect.addEventListener('change', () => {
            if (pvpGame) pvpGame.reset();
            if (pvpBoard) pvpBoard.start();
            updatePvPStatus();
        });
    }
});

document.getElementById('registerForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const playerId = document.getElementById('studentPlayerId').value.trim().toUpperCase();
    const name = document.getElementById('studentName').value.trim();
    const email = document.getElementById('studentEmail').value.trim();
    const course = document.getElementById('studentCourse').value;
    const mobile = document.getElementById('studentMobile').value.trim();
    const password = document.getElementById('studentPassword').value.trim();

    const newStudent = {
        playerId: playerId,
        name: name,
        email: email,
        course: course,
        phone: mobile,
        password: password,
        perf: { rating: 1200, wins: 0, losses: 0, draws: 0 }
    };

    // Store in global student registration list
    let students = JSON.parse(localStorage.getItem('registrations')) || [];
    if (students.some(s => s.playerId === playerId)) {
        alert('Player ID already registered!');
        return;
    }

    students.push(newStudent);
    localStorage.setItem('registrations', JSON.stringify(students));

    // Set current active user session automatically upon registration
    localStorage.setItem('currentUserSession', JSON.stringify({
        playerId: playerId,
        name: name,
        email: email,
        phone: mobile
    }));

    alert(`Registration Successful! Your Player ID is ${playerId}`);
    location.reload();
});






