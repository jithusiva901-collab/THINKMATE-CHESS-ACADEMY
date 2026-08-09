document.addEventListener('DOMContentLoaded', () => {
    const bookingModal = document.getElementById('bookingModal');
    const openFreeTrialBtn = document.getElementById('openFreeTrialModalBtn');
    const openOneOnOneBtn = document.getElementById('openOneOnOneModalBtn');
    const closeModalBtn = document.getElementById('closeBookingModalBtn');
    const bookingForm = document.getElementById('bookingForm');
    const bookingModalTitle = document.getElementById('bookingModalTitle');
    const bookingTypeInput = document.getElementById('bookingType');

    // Open Modal for Free Trial
    if (openFreeTrialBtn) {
        openFreeTrialBtn.addEventListener('click', () => {
            bookingModalTitle.textContent = 'Book Free Trial Class';
            bookingTypeInput.value = 'Free Trial';
            bookingModal.style.display = 'flex';
        });
    }

    // Open Modal for 1-on-1 Session
    if (openOneOnOneBtn) {
        openOneOnOneBtn.addEventListener('click', () => {
            bookingModalTitle.textContent = 'Book 1-on-1 Session';
            bookingTypeInput.value = '1-on-1 Section';
            bookingModal.style.display = 'flex';
        });
    }

    // Close Modal
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            bookingModal.style.display = 'none';
        });
    }

    // Close Modal when clicking outside the box
    window.addEventListener('click', (e) => {
        if (e.target === bookingModal) {
            bookingModal.style.display = 'none';
        }
    });

    // Handle Form Submission
    if (bookingForm) {
        bookingForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const userEmail = document.getElementById('bookingEmail').value.trim();
            const preferredDate = document.getElementById('bookingDate').value;
            const sessionType = bookingTypeInput.value;

            // Fetch existing booking requests
            const bookingRequests = JSON.parse(localStorage.getItem('bookingRequests')) || [];

            // Add new pending request
            bookingRequests.push({
                email: userEmail,
                type: sessionType,
                date: preferredDate,
                status: 'Pending',
                submittedOn: new Date().toLocaleDateString()
            });

            // Save to shared localStorage key
            localStorage.setItem('bookingRequests', JSON.stringify(bookingRequests));

            alert(`Your request for a ${sessionType} on ${preferredDate} has been sent! An admin will review and approve it shortly.`);
            
            bookingForm.reset();
            bookingModal.style.display = 'none';
        });
    }
});
document.addEventListener('DOMContentLoaded', () => {
    // Menu Icon Toggle Handler
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }
});


document.addEventListener('DOMContentLoaded', () => {
    const trialBtn = document.getElementById('trialBtn');
    const chessModal = document.getElementById('chessModal');
    const closeChessModal = document.getElementById('closeChessModal');
    const resetBoardBtn = document.getElementById('resetBoardBtn');
    const statusEl = document.getElementById('gameStatus');

    let board = null;
    let game = null;

    function initGame() {
        if (typeof Chess === 'undefined' || typeof Chessboard === 'undefined') return;

        game = new Chess();

        const config = {
            draggable: true,
            position: 'start',
            onDragStart: onDragStart,
            onDrop: onDrop,
            onSnapEnd: onSnapEnd,
            pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png'
        };

        board = Chessboard('board', config);
        updateStatus();
    }

    function onDragStart(source, piece) {
        // Do not pick up pieces if the game is over or if it's black's turn
        if (game.game_over()) return false;
        if (piece.search(/^b/) !== -1) return false;
    }

    function makeComputerMove() {
        const possibleMoves = game.moves();

        // Game over check
        if (possibleMoves.length === 0) return;

        // Computer selects a move
        const randomIdx = Math.floor(Math.random() * possibleMoves.length);
        game.move(possibleMoves[randomIdx]);
        board.position(game.fen());
        updateStatus();
    }

    function onDrop(source, target) {
        // See if the move is legal
        const move = game.move({
            from: source,
            to: target,
            promotion: 'q' // Automatically promote to queen for simplicity
        });

        // Illegal move
        if (move === null) return 'snapback';

        updateStatus();

        // Make automated computer move after 300ms delay
        window.setTimeout(makeComputerMove, 300);
    }

    function onSnapEnd() {
        board.position(game.fen());
    }

    function updateStatus() {
        if (!statusEl) return;

        let status = '';
        if (game.in_checkmate()) {
            status = 'Game over, position is in checkmate.';
        } else if (game.in_draw()) {
            status = 'Game over, drawn position.';
        } else {
            status = game.turn() === 'w' ? "Your Turn (White)" : "Computer is thinking...";
            if (game.in_check()) {
                status += ', Check!';
            }
        }
        statusEl.textContent = status;
    }

    // Modal Control
    if (trialBtn && chessModal) {
        trialBtn.addEventListener('click', (e) => {
            e.preventDefault();
            chessModal.style.display = 'flex';
            setTimeout(() => {
                if (!board) {
                    initGame();
                } else {
                    board.resize();
                }
            }, 100);
        });
    }

    if (closeChessModal && chessModal) {
        closeChessModal.addEventListener('click', () => {
            chessModal.style.display = 'none';
        });
    }

    if (resetBoardBtn) {
        resetBoardBtn.addEventListener('click', () => {
            if (game && board) {
                game.reset();
                board.start();
                updateStatus();
            }
        });
    }
});