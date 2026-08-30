/**
 * Pong vs AI
 * GameDev Hub
 */

(function () {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const PADDLE_W = 12;
    const PADDLE_H = 80;
    const BALL_R = 8;
    const WIN_SCORE = 5;

    let playerY = canvas.height / 2 - PADDLE_H / 2;
    let aiY = canvas.height / 2 - PADDLE_H / 2;
    let ballX = canvas.width / 2;
    let ballY = canvas.height / 2;
    let ballDX = 5;
    let ballDY = 3;
    let playerScore = 0;
    let aiScore = 0;
    let gameRunning = false;
    let gamePaused = false;
    let gameOver = false;
    let animId = null;
    let upPressed = false;
    let downPressed = false;

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

    function resetBall(direction) {
        ballX = canvas.width / 2;
        ballY = canvas.height / 2;
        ballDX = 5 * direction;
        ballDY = (Math.random() * 6 - 3);
    }

    function init() {
        playerScore = 0;
        aiScore = 0;
        playerY = canvas.height / 2 - PADDLE_H / 2;
        aiY = canvas.height / 2 - PADDLE_H / 2;
        gameOver = false;
        resetBall(1);
        updateUI();
    }

    function updateUI() {
        scoreDisplay.textContent = `${playerScore} - ${aiScore}`;
    }

    function draw() {
        // Background
        ctx.fillStyle = '#0a0a0f';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Center line
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.setLineDash([10, 10]);
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, 0);
        ctx.lineTo(canvas.width / 2, canvas.height);
        ctx.stroke();
        ctx.setLineDash([]);

        // Paddles
        ctx.fillStyle = '#a78bfa';
        ctx.shadowColor = '#a78bfa';
        ctx.shadowBlur = 10;
        ctx.fillRect(20, playerY, PADDLE_W, PADDLE_H);
        ctx.fillStyle = '#f472b6';
        ctx.shadowColor = '#f472b6';
        ctx.fillRect(canvas.width - 20 - PADDLE_W, aiY, PADDLE_W, PADDLE_H);
        ctx.shadowBlur = 0;

        // Ball
        ctx.fillStyle = '#fff';
        ctx.shadowColor = '#fff';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(ballX, ballY, BALL_R, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Scores on canvas
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.font = 'bold 48px Orbitron, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(playerScore, canvas.width / 4, 60);
        ctx.fillText(aiScore, (canvas.width * 3) / 4, 60);

        if (gameOver) {
            ctx.fillStyle = 'rgba(0,0,0,0.65)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 28px Orbitron, sans-serif';
            ctx.textAlign = 'center';
            const msg = playerScore >= WIN_SCORE ? 'YOU WIN!' : 'AI WINS';
            ctx.fillText(msg, canvas.width / 2, canvas.height / 2 - 10);
            ctx.font = '18px Inter, sans-serif';
            ctx.fillText(`Final: ${playerScore} - ${aiScore}`, canvas.width / 2, canvas.height / 2 + 25);
        }
    }

    function update() {
        if (!gameRunning || gamePaused || gameOver) return;

        // Player
        if (upPressed) playerY = Math.max(0, playerY - 6);
        if (downPressed) playerY = Math.min(canvas.height - PADDLE_H, playerY + 6);

        // Simple AI - follows ball with slight lag and error
        const aiCenter = aiY + PADDLE_H / 2;
        const target = ballY + (Math.random() - 0.5) * 20;
        if (aiCenter < target - 10) aiY += 4.2;
        else if (aiCenter > target + 10) aiY -= 4.2;
        aiY = Math.max(0, Math.min(canvas.height - PADDLE_H, aiY));

        // Ball
        ballX += ballDX;
        ballY += ballDY;

        // Top / bottom
        if (ballY - BALL_R < 0 || ballY + BALL_R > canvas.height) {
            ballDY = -ballDY;
        }

        // Player paddle
        if (
            ballX - BALL_R <= 20 + PADDLE_W &&
            ballX - BALL_R >= 20 &&
            ballY >= playerY &&
            ballY <= playerY + PADDLE_H &&
            ballDX < 0
        ) {
            ballDX = Math.abs(ballDX) * 1.05;
            const hit = (ballY - playerY) / PADDLE_H;
            ballDY = 8 * (hit - 0.5);
        }

        // AI paddle
        if (
            ballX + BALL_R >= canvas.width - 20 - PADDLE_W &&
            ballX + BALL_R <= canvas.width - 20 &&
            ballY >= aiY &&
            ballY <= aiY + PADDLE_H &&
            ballDX > 0
        ) {
            ballDX = -Math.abs(ballDX) * 1.05;
            const hit = (ballY - aiY) / PADDLE_H;
            ballDY = 8 * (hit - 0.5);
        }

        // Score
        if (ballX < 0) {
            aiScore++;
            updateUI();
            if (aiScore >= WIN_SCORE) endGame();
            else resetBall(1);
        } else if (ballX > canvas.width) {
            playerScore++;
            updateUI();
            if (playerScore >= WIN_SCORE) endGame();
            else resetBall(-1);
        }
    }

    function endGame() {
        gameOver = true;
        gameRunning = false;
        statusDisplay.textContent = playerScore >= WIN_SCORE ? 'You Win!' : 'AI Wins';
        startBtn.disabled = false;
        pauseBtn.disabled = true;
        scoreSubmit.style.display = 'block';
        finalScore.textContent = playerScore;
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
        if (gameOver) init();
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
        if (e.key === 'ArrowUp' || e.key === 'w') { upPressed = true; e.preventDefault(); }
        if (e.key === 'ArrowDown' || e.key === 's') { downPressed = true; e.preventDefault(); }
        if (e.key === 'p' || e.key === ' ') {
            e.preventDefault();
            if (gameRunning) togglePause();
            else startGame();
        }
    });
    document.addEventListener('keyup', e => {
        if (e.key === 'ArrowUp' || e.key === 'w') upPressed = false;
        if (e.key === 'ArrowDown' || e.key === 's') downPressed = false;
    });

    startBtn.addEventListener('click', startGame);
    pauseBtn.addEventListener('click', togglePause);
    restartBtn.addEventListener('click', restart);

    submitScoreBtn.addEventListener('click', async () => {
        const name = (playerName.value || 'Anonymous').trim().slice(0, 20);
        submitScoreBtn.disabled = true;
        submitMsg.textContent = 'Submitting...';
        const result = await submitScoreToServer('pong', name, playerScore);
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
