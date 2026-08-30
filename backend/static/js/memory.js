/**
 * Memory Match Card Game
 * GameDev Hub
 */

(function () {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const COLS = 4;
    const ROWS = 3;
    const CARD_W = 120;
    const CARD_H = 100;
    const GAP = 12;
    const TOTAL_W = COLS * CARD_W + (COLS - 1) * GAP;
    const TOTAL_H = ROWS * CARD_H + (ROWS - 1) * GAP;
    const OFFSET_X = (canvas.width - TOTAL_W) / 2;
    const OFFSET_Y = (canvas.height - TOTAL_H) / 2;

    const EMOJIS = ['🎮', '🚀', '⭐', '🔥', '💎', '🎯', '🦄', '🌈', '⚡', '🍕', '🐱', '🐶'];
    let cards = [];
    let flipped = [];
    let matched = 0;
    let moves = 0;
    let score = 0;
    let gameRunning = false;
    let gameOver = false;
    let lockBoard = false;

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

    pauseBtn.style.display = 'none';

    function shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    function initCards() {
        const pairs = EMOJIS.slice(0, 6);
        const values = shuffle([...pairs, ...pairs]);
        cards = values.map((val, i) => ({
            id: i,
            value: val,
            flipped: false,
            matched: false,
            col: i % COLS,
            row: Math.floor(i / COLS)
        }));
        flipped = [];
        matched = 0;
        moves = 0;
        score = 0;
        gameOver = false;
        lockBoard = false;
        updateUI();
    }

    function updateUI() {
        scoreDisplay.textContent = score;
        statusDisplay.textContent = gameRunning ? `Moves: ${moves}` : 'Ready';
    }

    function draw() {
        ctx.fillStyle = '#0a0a0f';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        cards.forEach(card => {
            const x = OFFSET_X + card.col * (CARD_W + GAP);
            const y = OFFSET_Y + card.row * (CARD_H + GAP);

            if (card.matched) {
                ctx.fillStyle = 'rgba(74, 222, 128, 0.2)';
                ctx.strokeStyle = '#4ade80';
            } else if (card.flipped) {
                ctx.fillStyle = '#1a1a24';
                ctx.strokeStyle = '#7c5cfc';
            } else {
                ctx.fillStyle = '#22222e';
                ctx.strokeStyle = '#2e2e3e';
            }

            ctx.lineWidth = 2;
            roundRect(ctx, x, y, CARD_W, CARD_H, 10);
            ctx.fill();
            ctx.stroke();

            if (card.flipped || card.matched) {
                ctx.font = '40px serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(card.value, x + CARD_W / 2, y + CARD_H / 2);
            } else {
                ctx.fillStyle = '#7c5cfc';
                ctx.font = 'bold 28px Orbitron, sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('?', x + CARD_W / 2, y + CARD_H / 2);
            }
        });

        if (gameOver) {
            ctx.fillStyle = 'rgba(0,0,0,0.6)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 28px Orbitron, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('You Win!', canvas.width / 2, canvas.height / 2 - 15);
            ctx.font = '18px Inter, sans-serif';
            ctx.fillText(`Score: ${score}  |  Moves: ${moves}`, canvas.width / 2, canvas.height / 2 + 20);
        }
    }

    function roundRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
    }

    function handleClick(e) {
        if (!gameRunning || gameOver || lockBoard) return;

        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const mx = (e.clientX - rect.left) * scaleX;
        const my = (e.clientY - rect.top) * scaleY;

        for (const card of cards) {
            if (card.flipped || card.matched) continue;
            const x = OFFSET_X + card.col * (CARD_W + GAP);
            const y = OFFSET_Y + card.row * (CARD_H + GAP);
            if (mx >= x && mx <= x + CARD_W && my >= y && my <= y + CARD_H) {
                flipCard(card);
                break;
            }
        }
    }

    function flipCard(card) {
        card.flipped = true;
        flipped.push(card);
        draw();

        if (flipped.length === 2) {
            moves++;
            lockBoard = true;
            updateUI();

            if (flipped[0].value === flipped[1].value) {
                flipped[0].matched = true;
                flipped[1].matched = true;
                matched += 2;
                score += 100;
                updateUI();
                flipped = [];
                lockBoard = false;

                if (matched === cards.length) {
                    // Bonus for fewer moves
                    score += Math.max(0, 500 - moves * 10);
                    updateUI();
                    gameOver = true;
                    gameRunning = false;
                    startBtn.disabled = false;
                    scoreSubmit.style.display = 'block';
                    finalScore.textContent = score;
                    statusDisplay.textContent = 'Complete!';
                }
                draw();
            } else {
                setTimeout(() => {
                    flipped[0].flipped = false;
                    flipped[1].flipped = false;
                    flipped = [];
                    lockBoard = false;
                    draw();
                }, 700);
            }
        }
    }

    function startGame() {
        initCards();
        gameRunning = true;
        scoreSubmit.style.display = 'none';
        startBtn.disabled = true;
        statusDisplay.textContent = 'Find the pairs!';
        draw();
    }

    function restart() {
        initCards();
        gameRunning = false;
        startBtn.disabled = false;
        scoreSubmit.style.display = 'none';
        statusDisplay.textContent = 'Ready';
        draw();
    }

    canvas.addEventListener('click', handleClick);
    startBtn.addEventListener('click', startGame);
    restartBtn.addEventListener('click', restart);

    submitScoreBtn.addEventListener('click', async () => {
        const name = (playerName.value || 'Anonymous').trim().slice(0, 20);
        submitScoreBtn.disabled = true;
        submitMsg.textContent = 'Submitting...';
        const result = await submitScoreToServer('memory', name, score);
        if (result.success) {
            submitMsg.textContent = 'Score submitted!';
            submitMsg.style.color = '#4ade80';
        } else {
            submitMsg.textContent = result.error || 'Failed';
            submitMsg.style.color = '#f87171';
            submitScoreBtn.disabled = false;
        }
    });

    initCards();
    draw();
})();
