/**
 * Tic Tac Toe with Minimax AI
 * GameDev Hub
 */

(function () {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const CELL = 120;
    const OFFSET_X = (canvas.width - CELL * 3) / 2;
    const OFFSET_Y = (canvas.height - CELL * 3) / 2;
    const PAD = 15;

    let board = Array(9).fill(null);
    let currentPlayer = 'X';
    let gameRunning = false;
    let gameOver = false;
    let winner = null;
    let score = 0; // wins
    let vsAI = true;

    const scoreDisplay = document.getElementById('scoreDisplay');
    const statusDisplay = document.getElementById('statusDisplay');
    const startBtn = document.getElementById('startBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const restartBtn = document.getElementById('restartBtn');
    const scoreSubmit = document.getElementById('scoreSubmit');
    const finalScore = document.getElementById('finalScore');
    const playerName = document.getElementById('playerName');
    const submitScoreBtn = document.getElementById('submitScoreBtn');
    const submitMsg = document.getElementById('submitMsg');

    pauseBtn.style.display = 'none'; // not needed

    function resetBoard() {
        board = Array(9).fill(null);
        currentPlayer = 'X';
        gameOver = false;
        winner = null;
        scoreSubmit.style.display = 'none';
    }

    function draw() {
        ctx.fillStyle = '#0a0a0f';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Board lines
        ctx.strokeStyle = '#7c5cfc';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';

        // Vertical
        for (let i = 1; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(OFFSET_X + i * CELL, OFFSET_Y + PAD);
            ctx.lineTo(OFFSET_X + i * CELL, OFFSET_Y + 3 * CELL - PAD);
            ctx.stroke();
        }
        // Horizontal
        for (let i = 1; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(OFFSET_X + PAD, OFFSET_Y + i * CELL);
            ctx.lineTo(OFFSET_X + 3 * CELL - PAD, OFFSET_Y + i * CELL);
            ctx.stroke();
        }

        // Marks
        for (let i = 0; i < 9; i++) {
            const col = i % 3;
            const row = Math.floor(i / 3);
            const cx = OFFSET_X + col * CELL + CELL / 2;
            const cy = OFFSET_Y + row * CELL + CELL / 2;

            if (board[i] === 'X') {
                ctx.strokeStyle = '#60a5fa';
                ctx.lineWidth = 6;
                ctx.beginPath();
                ctx.moveTo(cx - 30, cy - 30);
                ctx.lineTo(cx + 30, cy + 30);
                ctx.moveTo(cx + 30, cy - 30);
                ctx.lineTo(cx - 30, cy + 30);
                ctx.stroke();
            } else if (board[i] === 'O') {
                ctx.strokeStyle = '#f472b6';
                ctx.lineWidth = 6;
                ctx.beginPath();
                ctx.arc(cx, cy, 32, 0, Math.PI * 2);
                ctx.stroke();
            }
        }

        if (gameOver && winner) {
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 28px Orbitron, sans-serif';
            ctx.textAlign = 'center';
            const msg = winner === 'draw' ? "It's a Draw!" : (winner === 'X' ? 'You Win!' : 'AI Wins!');
            ctx.fillText(msg, canvas.width / 2, canvas.height / 2);
        }
    }

    function checkWinner() {
        const lines = [
            [0,1,2],[3,4,5],[6,7,8],
            [0,3,6],[1,4,7],[2,5,8],
            [0,4,8],[2,4,6]
        ];
        for (const [a,b,c] of lines) {
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return board[a];
            }
        }
        if (board.every(c => c !== null)) return 'draw';
        return null;
    }

    // Minimax
    function minimax(isMax) {
        const result = checkWinner();
        if (result === 'O') return 10;
        if (result === 'X') return -10;
        if (result === 'draw') return 0;

        if (isMax) {
            let best = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (!board[i]) {
                    board[i] = 'O';
                    best = Math.max(best, minimax(false));
                    board[i] = null;
                }
            }
            return best;
        } else {
            let best = Infinity;
            for (let i = 0; i < 9; i++) {
                if (!board[i]) {
                    board[i] = 'X';
                    best = Math.min(best, minimax(true));
                    board[i] = null;
                }
            }
            return best;
        }
    }

    function bestMove() {
        let bestVal = -Infinity;
        let move = -1;
        for (let i = 0; i < 9; i++) {
            if (!board[i]) {
                board[i] = 'O';
                const val = minimax(false);
                board[i] = null;
                if (val > bestVal) {
                    bestVal = val;
                    move = i;
                }
            }
        }
        return move;
    }

    function handleClick(e) {
        if (!gameRunning || gameOver || currentPlayer !== 'X') return;

        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        if (x < OFFSET_X || x > OFFSET_X + 3 * CELL || y < OFFSET_Y || y > OFFSET_Y + 3 * CELL) return;

        const col = Math.floor((x - OFFSET_X) / CELL);
        const row = Math.floor((y - OFFSET_Y) / CELL);
        const idx = row * 3 + col;

        if (board[idx]) return;

        board[idx] = 'X';
        draw();

        let result = checkWinner();
        if (result) {
            finish(result);
            return;
        }

        currentPlayer = 'O';
        statusDisplay.textContent = 'AI thinking...';

        setTimeout(() => {
            const move = bestMove();
            if (move !== -1) board[move] = 'O';
            draw();
            result = checkWinner();
            if (result) {
                finish(result);
            } else {
                currentPlayer = 'X';
                statusDisplay.textContent = 'Your turn (X)';
            }
        }, 350);
    }

    function finish(result) {
        gameOver = true;
        gameRunning = false;
        winner = result;
        if (result === 'X') {
            score += 1;
            scoreDisplay.textContent = score;
            statusDisplay.textContent = 'You Win!';
        } else if (result === 'O') {
            statusDisplay.textContent = 'AI Wins';
        } else {
            statusDisplay.textContent = 'Draw';
        }
        scoreSubmit.style.display = 'block';
        finalScore.textContent = score;
        startBtn.disabled = false;
        draw();
    }

    function startGame() {
        resetBoard();
        gameRunning = true;
        statusDisplay.textContent = 'Your turn (X)';
        startBtn.disabled = true;
        draw();
    }

    function restart() {
        resetBoard();
        gameRunning = false;
        statusDisplay.textContent = 'Ready';
        startBtn.disabled = false;
        draw();
    }

    canvas.addEventListener('click', handleClick);
    startBtn.addEventListener('click', startGame);
    restartBtn.addEventListener('click', restart);

    submitScoreBtn.addEventListener('click', async () => {
        const name = (playerName.value || 'Anonymous').trim().slice(0, 20);
        submitScoreBtn.disabled = true;
        submitMsg.textContent = 'Submitting...';
        const result = await submitScoreToServer('tictactoe', name, score);
        if (result.success) {
            submitMsg.textContent = 'Score submitted!';
            submitMsg.style.color = '#4ade80';
        } else {
            submitMsg.textContent = result.error || 'Failed';
            submitMsg.style.color = '#f87171';
            submitScoreBtn.disabled = false;
        }
    });

    statusDisplay.textContent = 'Ready';
    scoreDisplay.textContent = '0';
    draw();
})();
