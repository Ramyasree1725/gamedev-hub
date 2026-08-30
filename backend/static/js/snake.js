/**
 * Classic Snake Game - Full Implementation
 * GameDev Hub
 */

(function () {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const GRID = 20;
    const COLS = canvas.width / GRID;
    const ROWS = canvas.height / GRID;

    let snake = [];
    let food = { x: 0, y: 0 };
    let direction = { x: 1, y: 0 };
    let nextDirection = { x: 1, y: 0 };
    let score = 0;
    let highScore = 0;
    let gameRunning = false;
    let gamePaused = false;
    let gameOver = false;
    let loopId = null;
    let speed = 120; // ms

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

    function initSnake() {
        const startX = Math.floor(COLS / 2);
        const startY = Math.floor(ROWS / 2);
        snake = [
            { x: startX, y: startY },
            { x: startX - 1, y: startY },
            { x: startX - 2, y: startY }
        ];
        direction = { x: 1, y: 0 };
        nextDirection = { x: 1, y: 0 };
        score = 0;
        speed = 120;
        gameOver = false;
        updateScore();
        spawnFood();
    }

    function spawnFood() {
        let valid = false;
        while (!valid) {
            food.x = Math.floor(Math.random() * COLS);
            food.y = Math.floor(Math.random() * ROWS);
            valid = !snake.some(s => s.x === food.x && s.y === food.y);
        }
    }

    function updateScore() {
        scoreDisplay.textContent = score;
        if (score > highScore) highScore = score;
    }

    function draw() {
        // Clear
        ctx.fillStyle = '#0a0a0f';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Grid (subtle)
        ctx.strokeStyle = 'rgba(255,255,255,0.03)';
        ctx.lineWidth = 1;
        for (let x = 0; x <= canvas.width; x += GRID) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        for (let y = 0; y <= canvas.height; y += GRID) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }

        // Food
        ctx.fillStyle = '#f87171';
        ctx.shadowColor = '#f87171';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(
            food.x * GRID + GRID / 2,
            food.y * GRID + GRID / 2,
            GRID / 2 - 2,
            0,
            Math.PI * 2
        );
        ctx.fill();
        ctx.shadowBlur = 0;

        // Snake
        snake.forEach((seg, i) => {
            const isHead = i === 0;
            ctx.fillStyle = isHead ? '#4ade80' : '#22c55e';
            ctx.shadowColor = isHead ? '#4ade80' : 'transparent';
            ctx.shadowBlur = isHead ? 10 : 0;
            ctx.fillRect(
                seg.x * GRID + 1,
                seg.y * GRID + 1,
                GRID - 2,
                GRID - 2
            );
            if (isHead) {
                // Eyes
                ctx.fillStyle = '#0a0a0f';
                const eyeOffset = 4;
                const dx = direction.x;
                const dy = direction.y;
                ctx.beginPath();
                ctx.arc(
                    seg.x * GRID + GRID / 2 + dx * 3 - (dy !== 0 ? eyeOffset : 0),
                    seg.y * GRID + GRID / 2 + dy * 3 - (dx !== 0 ? eyeOffset : 0),
                    2, 0, Math.PI * 2
                );
                ctx.arc(
                    seg.x * GRID + GRID / 2 + dx * 3 + (dy !== 0 ? eyeOffset : 0),
                    seg.y * GRID + GRID / 2 + dy * 3 + (dx !== 0 ? eyeOffset : 0),
                    2, 0, Math.PI * 2
                );
                ctx.fill();
            }
        });
        ctx.shadowBlur = 0;

        if (gameOver) {
            ctx.fillStyle = 'rgba(0,0,0,0.65)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 32px Orbitron, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 10);
            ctx.font = '18px Inter, sans-serif';
            ctx.fillText('Score: ' + score, canvas.width / 2, canvas.height / 2 + 25);
        }
    }

    function update() {
        if (!gameRunning || gamePaused || gameOver) return;

        direction = { ...nextDirection };

        const head = {
            x: snake[0].x + direction.x,
            y: snake[0].y + direction.y
        };

        // Wall collision
        if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) {
            endGame();
            return;
        }

        // Self collision
        if (snake.some(s => s.x === head.x && s.y === head.y)) {
            endGame();
            return;
        }

        snake.unshift(head);

        // Eat food
        if (head.x === food.x && head.y === food.y) {
            score += 10;
            updateScore();
            spawnFood();
            // Speed up slightly
            if (speed > 50) speed -= 2;
        } else {
            snake.pop();
        }
    }

    function endGame() {
        gameOver = true;
        gameRunning = false;
        statusDisplay.textContent = 'Game Over';
        pauseBtn.disabled = true;
        startBtn.disabled = false;
        scoreSubmit.style.display = 'block';
        finalScore.textContent = score;
        submitMsg.textContent = '';
        if (loopId) {
            clearInterval(loopId);
            loopId = null;
        }
        draw();
    }

    function gameLoop() {
        update();
        draw();
    }

    function startGame() {
        if (gameRunning && !gameOver) return;
        if (gameOver || snake.length === 0) {
            initSnake();
        }
        gameRunning = true;
        gamePaused = false;
        gameOver = false;
        scoreSubmit.style.display = 'none';
        statusDisplay.textContent = 'Playing';
        startBtn.disabled = true;
        pauseBtn.disabled = false;
        pauseBtn.textContent = 'Pause';

        if (loopId) clearInterval(loopId);
        loopId = setInterval(gameLoop, speed);
        draw();
    }

    function togglePause() {
        if (!gameRunning || gameOver) return;
        gamePaused = !gamePaused;
        statusDisplay.textContent = gamePaused ? 'Paused' : 'Playing';
        pauseBtn.textContent = gamePaused ? 'Resume' : 'Pause';
        if (gamePaused) {
            if (loopId) {
                clearInterval(loopId);
                loopId = null;
            }
        } else {
            loopId = setInterval(gameLoop, speed);
        }
    }

    function restart() {
        if (loopId) {
            clearInterval(loopId);
            loopId = null;
        }
        initSnake();
        gameRunning = false;
        gamePaused = false;
        gameOver = false;
        scoreSubmit.style.display = 'none';
        statusDisplay.textContent = 'Ready';
        startBtn.disabled = false;
        pauseBtn.disabled = true;
        pauseBtn.textContent = 'Pause';
        draw();
    }

    // Input
    document.addEventListener('keydown', (e) => {
        if (!gameRunning || gamePaused || gameOver) {
            if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                startGame();
            }
            return;
        }

        const key = e.key.toLowerCase();
        if (['arrowup', 'w'].includes(key) && direction.y === 0) {
            nextDirection = { x: 0, y: -1 };
            e.preventDefault();
        } else if (['arrowdown', 's'].includes(key) && direction.y === 0) {
            nextDirection = { x: 0, y: 1 };
            e.preventDefault();
        } else if (['arrowleft', 'a'].includes(key) && direction.x === 0) {
            nextDirection = { x: -1, y: 0 };
            e.preventDefault();
        } else if (['arrowright', 'd'].includes(key) && direction.x === 0) {
            nextDirection = { x: 1, y: 0 };
            e.preventDefault();
        } else if (key === 'p' || key === ' ') {
            togglePause();
            e.preventDefault();
        }
    });

    // Buttons
    startBtn.addEventListener('click', startGame);
    pauseBtn.addEventListener('click', togglePause);
    restartBtn.addEventListener('click', restart);

    submitScoreBtn.addEventListener('click', async () => {
        const name = (playerName.value || 'Anonymous').trim().slice(0, 20);
        submitScoreBtn.disabled = true;
        submitMsg.textContent = 'Submitting...';
        const result = await submitScoreToServer('snake', name, score);
        if (result.success) {
            submitMsg.textContent = 'Score submitted! Check the Leaderboard.';
            submitMsg.style.color = '#4ade80';
        } else {
            submitMsg.textContent = result.error || 'Failed to submit';
            submitMsg.style.color = '#f87171';
            submitScoreBtn.disabled = false;
        }
    });

    // Initial draw
    initSnake();
    statusDisplay.textContent = 'Ready';
    draw();
})();
