
/**
 * GameDev Hub - Lightweight Particle System (standalone)
 */
(function (global) {
    "use strict";

    class ParticlePool {
        constructor(max = 300) {
            this.pool = [];
            this.active = [];
            this.max = max;
            for (let i = 0; i < max; i++) {
                this.pool.push(this._create());
            }
        }

        _create() {
            return {
                x: 0, y: 0, vx: 0, vy: 0,
                life: 0, maxLife: 1, size: 3,
                color: "#fff", alpha: 1, active: false,
                gravity: 0, friction: 0.98,
            };
        }

        emit(x, y, count, opts = {}) {
            for (let i = 0; i < count; i++) {
                let p = this.pool.pop();
                if (!p) {
                    if (this.active.length > 0) p = this.active.shift();
                    else break;
                }
                const angle = opts.angle != null ? opts.angle : Math.random() * Math.PI * 2;
                const speed = (opts.speed || 80) * (0.4 + Math.random() * 0.6);
                p.x = x; p.y = y;
                p.vx = Math.cos(angle) * speed;
                p.vy = Math.sin(angle) * speed;
                p.life = p.maxLife = opts.life || (0.4 + Math.random() * 0.6);
                p.size = opts.size || (2 + Math.random() * 4);
                p.color = opts.color || "#ffffff";
                p.gravity = opts.gravity || 0;
                p.friction = opts.friction || 0.97;
                p.active = true;
                this.active.push(p);
            }
        }

        burst(x, y, color) {
            this.emit(x, y, 12, { color, speed: 120, life: 0.5, size: 3 });
        }

        update(dt) {
            for (let i = this.active.length - 1; i >= 0; i--) {
                const p = this.active[i];
                p.vy += p.gravity * dt;
                p.vx *= p.friction;
                p.vy *= p.friction;
                p.x += p.vx * dt;
                p.y += p.vy * dt;
                p.life -= dt;
                p.alpha = Math.max(0, p.life / p.maxLife);
                if (p.life <= 0) {
                    p.active = false;
                    this.active.splice(i, 1);
                    this.pool.push(p);
                }
            }
        }

        draw(ctx) {
            for (const p of this.active) {
                ctx.globalAlpha = p.alpha;
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalAlpha = 1;
        }

        clear() {
            while (this.active.length) {
                const p = this.active.pop();
                p.active = false;
                this.pool.push(p);
            }
        }

        get count() { return this.active.length; }
    }

    if (typeof module !== "undefined" && module.exports) {
        module.exports = { ParticlePool };
    } else {
        global.GDHParticles = { ParticlePool };
    }
})(typeof window !== "undefined" ? window : globalThis);
