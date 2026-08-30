/**
 * Breakout / Brick Breaker
 * GameDev Hub
 */

(function () {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const PADDLE_W = 100;
    const PADDLE_H = 14;
    const BALL_R = 8;
    const BRICK_ROWS = 5;
    const BRICK_COLS = 10;
    const BRICK_H = 22;
    const BRICK_GAP = 4;
    const BRICK_TOP = 50;

    let paddleX = canvas.width / 2 - PADDLE_W / 2;
    let ballX = canvas.width / 2;
    let ballY = canvas.height - 60;
    let ballDX = 4;
    let ballDY = -4;
    let bricks = [];
    let score = 0;
    let lives = 3;
    let gameRunning = false;
    let gamePaused = false;
    let gameOver = false;
    let animId = null;
    let rightPressed = false;
    let leftPressed = false;

    const scoreDisplay = document.getElementById('scoreDisplay');
    const livesDisplay = document.getElementById('livesDisplay');
    const statusDisplay = document.getElementById('statusDisplay');
    const startBtn = document.getElementById('startBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const restartBtn = document.getElementById('restartBtn');
    const scoreSubmit = document.getElementById('scoreSubmit');
    const finalScore = document.getElementById('finalScore');
    const playerName = document.getElementById('playerName');
    const submitScoreBtn = document.getElementById('submitScoreBtn');
    const submitMsg = document.getElementById('submitMsg');

    const COLORS = ['#f87171', '#fb923c', '#fbbf24', '#4ade80', '#60a5fa'];

    function initBricks() {
        bricks = [];
        const totalGap = (BRICK_COLS - 1) * BRICK_GAP;
        const brickW = (canvas.width - 40 - totalGap) / BRICK_COLS;
        for (let r = 0; r < BRICK_ROWS; r++) {
            for (let c = 0; c < BRICK_COLS; c++) {
                bricks.push({
                    x: 20 + c * (brickW + BRICK_GAP),
                    y: BRICK_TOP + r * (BRICK_H + BRICK_GAP),
                    w: brickW,
                    h: BRICK_H,
                    alive: true,
                    color: COLORS[r % COLORS.length]
                });
            }
        }
    }

    function resetBall() {
        ballX = canvas.width / 2;
        ballY = canvas.height - 60;
        ballDX = 4 * (Math.random() > 0.5 ? 1 : -1);
        ballDY = -4;
        paddleX = canvas.width / 2 - PADDLE_W / 2;
    }

    function init() {
        score = 0;
        lives = 3;
        gameOver = false;
        initBricks();
        resetBall();
        updateUI();
    }

    function updateUI() {
        scoreDisplay.textContent = score;
        livesDisplay.textContent = 'Lives: ' + lives;
    }

    function draw() {
        ctx.fillStyle = '#0a0a0f';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Bricks
        bricks.forEach(b => {
            if (!b.alive) return;
            ctx.fillStyle = b.color;
            ctx.shadowColor = b.color;
            ctx.shadowBlur = 6;
            ctx.fillRect(b.x, b.y, b.w, b.h);
        });
        ctx.shadowBlur = 0;

        // Paddle
        ctx.fillStyle = '#a78bfa';
        ctx.shadowColor = '#a78bfa';
        ctx.shadowBlur = 10;
        ctx.fillRect(paddleX, canvas.height - 30, PADDLE_W, PADDLE_H);
        ctx.shadowBlur = 0;

        // Ball
        ctx.fillStyle = '#fff';
        ctx.shadowColor = '#fff';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(ballX, ballY, BALL_R, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        if (gameOver) {
            ctx.fillStyle = 'rgba(0,0,0,0.65)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 28px Orbitron, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(lives <= 0 ? 'GAME OVER' : 'YOU WIN!', canvas.width / 2, canvas.height / 2 - 10);
            ctx.font = '18px Inter, sans-serif';
            ctx.fillText('Score: ' + score, canvas.width / 2, canvas.height / 2 + 25);
        }
    }

    function update() {
        if (!gameRunning || gamePaused || gameOver) return;

        // Paddle movement
        if (rightPressed) paddleX = Math.min(paddleX + 7, canvas.width - PADDLE_W);
        if (leftPressed) paddleX = Math.max(paddleX - 7, 0);

        ballX += ballDX;
        ballY += ballDY;

        // Walls
        if (ballX - BALL_R < 0 || ballX + BALL_R > canvas.width) ballDX = -ballDX;
        if (ballY - BALL_R < 0) ballDY = -ballDY;

        // Bottom
        if (ballY + BALL_R > canvas.height) {
            lives--;
            updateUI();
            if (lives <= 0) {
                endGame(false);
            } else {
                resetBall();
            }
            return;
        }

        // Paddle collision
        if (
            ballY + BALL_R >= canvas.height - 30 &&
            ballY + BALL_R <= canvas.height - 30 + PADDLE_H &&
            ballX >= paddleX &&
            ballX <= paddleX + PADDLE_W
        ) {
            ballDY = -Math.abs(ballDY);
            // Angle based on hit position
            const hitPos = (ballX - paddleX) / PADDLE_W;
            ballDX = 8 * (hitPos - 0.5);
        }

        // Brick collision
        for (const b of bricks) {
            if (!b.alive) continue;
            if (
                ballX + BALL_R > b.x &&
                ballX - BALL_R < b.x + b.w &&
                ballY + BALL_R > b.y &&
                ballY - BALL_R < b.y + b.h
            ) {
                b.alive = false;
                ballDY = -ballDY;
                score += 10;
                updateUI();

                if (bricks.every(br => !br.alive)) {
                    endGame(true);
                }
                break;
            }
        }
    }

    function endGame(won) {
        gameOver = true;
        gameRunning = false;
        statusDisplay.textContent = won ? 'You Win!' : 'Game Over';
        startBtn.disabled = false;
        pauseBtn.disabled = true;
        scoreSubmit.style.display = 'block';
        finalScore.textContent = score;
        if (animId) cancelAnimationFrame(animId);
        draw();
    }

    function loop() {
        update();
        draw();
        if (gameRunning && !gamePaused && !gameOver) {
            animId = requestAnimationFrame(loop);
        }
    }

    function startGame() {
        if (gameRunning && !gameOver) return;
        if (gameOver || bricks.length === 0) init();
        gameRunning = true;
        gamePaused = false;
        gameOver = false;
        scoreSubmit.style.display = 'none';
        statusDisplay.textContent = 'Playing';
        startBtn.disabled = true;
        pauseBtn.disabled = false;
        pauseBtn.textContent = 'Pause';
        loop();
    }

    function togglePause() {
        if (!gameRunning || gameOver) return;
        gamePaused = !gamePaused;
        statusDisplay.textContent = gamePaused ? 'Paused' : 'Playing';
        pauseBtn.textContent = gamePaused ? 'Resume' : 'Pause';
        if (!gamePaused) loop();
    }

    function restart() {
        if (animId) cancelAnimationFrame(animId);
        init();
        gameRunning = false;
        gamePaused = false;
        startBtn.disabled = false;
        pauseBtn.disabled = true;
        scoreSubmit.style.display = 'none';
        statusDisplay.textContent = 'Ready';
        draw();
    }

    document.addEventListener('keydown', e => {
        if (e.key === 'ArrowRight' || e.key === 'd') rightPressed = true;
        if (e.key === 'ArrowLeft' || e.key === 'a') leftPressed = true;
        if (e.key === 'p' || e.key === ' ') {
            e.preventDefault();
            if (gameRunning) togglePause();
            else startGame();
        }
    });
    document.addEventListener('keyup', e => {
        if (e.key === 'ArrowRight' || e.key === 'd') rightPressed = false;
        if (e.key === 'ArrowLeft' || e.key === 'a') leftPressed = false;
    });

    // Mouse control
    canvas.addEventListener('mousemove', e => {
        if (!gameRunning || gamePaused) return;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const mx = (e.clientX - rect.left) * scaleX;
        paddleX = Math.max(0, Math.min(mx - PADDLE_W / 2, canvas.width - PADDLE_W));
    });

    startBtn.addEventListener('click', startGame);
    pauseBtn.addEventListener('click', togglePause);
    restartBtn.addEventListener('click', restart);

    submitScoreBtn.addEventListener('click', async () => {
        const name = (playerName.value || 'Anonymous').trim().slice(0, 20);
        submitScoreBtn.disabled = true;
        submitMsg.textContent = 'Submitting...';
        const result = await submitScoreToServer('breakout', name, score);
        if (result.success) {
            submitMsg.textContent = 'Score submitted!';
            submitMsg.style.color = '#4ade80';
        } else {
            submitMsg.textContent = result.error || 'Failed';
            submitMsg.style.color = '#f87171';
            submitScoreBtn.disabled = false;
        }
    });

    init();
    statusDisplay.textContent = 'Ready';
    draw();
})();
