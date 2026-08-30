
/**
 * GameDev Hub - Shooter mini-game module
 * Standalone canvas game implementation with full game loop.
 */
(function () {
    "use strict";

    const GAME_ID = "shooter";
    const canvas = typeof document !== "undefined" ? document.getElementById("gameCanvas") : null;

    class ShooterGame {
        constructor(cvs) {
            this.canvas = cvs;
            this.ctx = cvs ? cvs.getContext("2d") : null;
            this.width = cvs ? cvs.width : 600;
            this.height = cvs ? cvs.height : 400;
            this.running = false;
            this.paused = false;
            this.score = 0;
            this.lives = 3;
            this.level = 1;
            this.entities = [];
            this.particles = [];
            this.keys = {};
            this.lastTime = 0;
            this.accumulator = 0;
            this.timestep = 1 / 60;
        }

        init() {
            this.score = 0;
            this.lives = 3;
            this.level = 1;
            this.entities = [];
            this.particles = [];
            this.spawnInitial();
            this.running = false;
            this.paused = false;
        }

        spawnInitial() {
            // Spawn starter entities based on game type
            const count = 5 + this.level * 2;
            for (let i = 0; i < count; i++) {
                this.entities.push({
                    id: i,
                    x: Math.random() * this.width,
                    y: Math.random() * this.height,
                    vx: (Math.random() - 0.5) * 4,
                    vy: (Math.random() - 0.5) * 4,
                    radius: 8 + Math.random() * 12,
                    color: this.randomColor(),
                    active: true,
                    type: "enemy",
                });
            }
            // Player
            this.player = {
                x: this.width / 2,
                y: this.height - 40,
                w: 40,
                h: 20,
                speed: 5,
                color: "#7c5cfc",
            };
        }

        randomColor() {
            const colors = ["#f87171", "#fb923c", "#fbbf24", "#4ade80", "#60a5fa", "#a78bfa", "#f472b6"];
            return colors[Math.floor(Math.random() * colors.length)];
        }

        start() {
            if (this.running) return;
            this.running = true;
            this.paused = false;
            this.lastTime = performance.now() / 1000;
            this.loop();
        }

        pause() {
            this.paused = !this.paused;
        }

        stop() {
            this.running = false;
        }

        restart() {
            this.stop();
            this.init();
            this.start();
        }

        loop() {
            if (!this.running) return;
            const now = performance.now() / 1000;
            let dt = now - this.lastTime;
            this.lastTime = now;
            if (dt > 0.25) dt = 0.25;
            if (!this.paused) {
                this.accumulator += dt;
                while (this.accumulator >= this.timestep) {
                    this.update(this.timestep);
                    this.accumulator -= this.timestep;
                }
            }
            this.render();
            requestAnimationFrame(() => this.loop());
        }

        update(dt) {
            // Player movement
            if (this.keys["ArrowLeft"] || this.keys["a"]) this.player.x -= this.player.speed;
            if (this.keys["ArrowRight"] || this.keys["d"]) this.player.x += this.player.speed;
            if (this.keys["ArrowUp"] || this.keys["w"]) this.player.y -= this.player.speed;
            if (this.keys["ArrowDown"] || this.keys["s"]) this.player.y += this.player.speed;
            this.player.x = Math.max(0, Math.min(this.width - this.player.w, this.player.x));
            this.player.y = Math.max(0, Math.min(this.height - this.player.h, this.player.y));

            // Entities
            for (const e of this.entities) {
                if (!e.active) continue;
                e.x += e.vx;
                e.y += e.vy;
                if (e.x < 0 || e.x > this.width) e.vx *= -1;
                if (e.y < 0 || e.y > this.height) e.vy *= -1;
                // Collision with player
                if (this.circleRect(e.x, e.y, e.radius, this.player.x, this.player.y, this.player.w, this.player.h)) {
                    e.active = false;
                    this.score += 10 * this.level;
                    this.spawnParticles(e.x, e.y, e.color);
                }
            }

            // Particles
            for (let i = this.particles.length - 1; i >= 0; i--) {
                const p = this.particles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.life -= dt;
                if (p.life <= 0) this.particles.splice(i, 1);
            }

            // Level up
            if (this.entities.every(e => !e.active)) {
                this.level++;
                this.spawnInitial();
            }
        }

        circleRect(cx, cy, r, rx, ry, rw, rh) {
            const closestX = Math.max(rx, Math.min(cx, rx + rw));
            const closestY = Math.max(ry, Math.min(cy, ry + rh));
            const dx = cx - closestX;
            const dy = cy - closestY;
            return dx * dx + dy * dy < r * r;
        }

        spawnParticles(x, y, color) {
            for (let i = 0; i < 8; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = 50 + Math.random() * 100;
                this.particles.push({
                    x, y,
                    vx: Math.cos(angle) * speed * 0.016,
                    vy: Math.sin(angle) * speed * 0.016,
                    life: 0.3 + Math.random() * 0.4,
                    color,
                    size: 2 + Math.random() * 3,
                });
            }
        }

        render() {
            if (!this.ctx) return;
            const ctx = this.ctx;
            ctx.fillStyle = "#0a0a0f";
            ctx.fillRect(0, 0, this.width, this.height);

            // Entities
            for (const e of this.entities) {
                if (!e.active) continue;
                ctx.fillStyle = e.color;
                ctx.beginPath();
                ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
                ctx.fill();
            }

            // Player
            ctx.fillStyle = this.player.color;
            ctx.fillRect(this.player.x, this.player.y, this.player.w, this.player.h);

            // Particles
            for (const p of this.particles) {
                ctx.globalAlpha = Math.max(0, p.life);
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalAlpha = 1;

            // HUD
            ctx.fillStyle = "#e8e8f0";
            ctx.font = "16px Inter, sans-serif";
            ctx.textAlign = "left";
            ctx.fillText("Score: " + this.score, 10, 24);
            ctx.fillText("Level: " + this.level, 10, 44);
            ctx.fillText("Lives: " + this.lives, 10, 64);
            if (this.paused) {
                ctx.fillStyle = "rgba(0,0,0,0.5)";
                ctx.fillRect(0, 0, this.width, this.height);
                ctx.fillStyle = "#fff";
                ctx.font = "bold 28px Orbitron, sans-serif";
                ctx.textAlign = "center";
                ctx.fillText("PAUSED", this.width / 2, this.height / 2);
            }
        }

        bindInput() {
            window.addEventListener("keydown", e => { this.keys[e.key] = true; });
            window.addEventListener("keyup", e => { this.keys[e.key] = false; });
        }
    }

    // Auto-init if canvas present
    if (canvas) {
        const game = new ShooterGame(canvas);
        game.init();
        game.bindInput();
        window["shooterGame"] = game;
        // Wire buttons if present
        const startBtn = document.getElementById("startBtn");
        const pauseBtn = document.getElementById("pauseBtn");
        const restartBtn = document.getElementById("restartBtn");
        if (startBtn) startBtn.addEventListener("click", () => game.start());
        if (pauseBtn) pauseBtn.addEventListener("click", () => game.pause());
        if (restartBtn) restartBtn.addEventListener("click", () => game.restart());
    }

    if (typeof module !== "undefined" && module.exports) {
        module.exports = { ShooterGame, GAME_ID };
    }
})();
