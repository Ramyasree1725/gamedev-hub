
/**
 * GameDev Hub - Engine Module: engine_25
 * Core game engine utilities and systems.
 * Module ID: 25
 */
(function (global) {
    "use strict";

    const MODULE_ID = 25;
    const MODULE_NAME = "engine_25";

    class Vec2 {
        constructor(x = 0, y = 0) {
            this.x = x;
            this.y = y;
        }
        add(v) { return new Vec2(this.x + v.x, this.y + v.y); }
        sub(v) { return new Vec2(this.x - v.x, this.y - v.y); }
        mul(s) { return new Vec2(this.x * s, this.y * s); }
        div(s) { return s !== 0 ? new Vec2(this.x / s, this.y / s) : new Vec2(); }
        length() { return Math.sqrt(this.x * this.x + this.y * this.y); }
        lengthSq() { return this.x * this.x + this.y * this.y; }
        normalize() {
            const len = this.length();
            return len > 0 ? this.div(len) : new Vec2();
        }
        dot(v) { return this.x * v.x + this.y * v.y; }
        cross(v) { return this.x * v.y - this.y * v.x; }
        distance(v) { return this.sub(v).length(); }
        angle() { return Math.atan2(this.y, this.x); }
        rotate(rad) {
            const c = Math.cos(rad), s = Math.sin(rad);
            return new Vec2(this.x * c - this.y * s, this.x * s + this.y * c);
        }
        clone() { return new Vec2(this.x, this.y); }
        equals(v, eps = 1e-6) {
            return Math.abs(this.x - v.x) < eps && Math.abs(this.y - v.y) < eps;
        }
        static fromAngle(rad, length = 1) {
            return new Vec2(Math.cos(rad) * length, Math.sin(rad) * length);
        }
        static lerp(a, b, t) {
            return new Vec2(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t);
        }
        static zero() { return new Vec2(0, 0); }
        static one() { return new Vec2(1, 1); }
    }

    class AABB {
        constructor(x, y, w, h) {
            this.x = x; this.y = y; this.w = w; this.h = h;
        }
        get left() { return this.x; }
        get right() { return this.x + this.w; }
        get top() { return this.y; }
        get bottom() { return this.y + this.h; }
        get center() { return new Vec2(this.x + this.w / 2, this.y + this.h / 2); }
        contains(px, py) {
            return px >= this.x && px <= this.x + this.w && py >= this.y && py <= this.y + this.h;
        }
        intersects(other) {
            return !(this.right < other.left || this.left > other.right ||
                     this.bottom < other.top || this.top > other.bottom);
        }
        expand(amount) {
            return new AABB(this.x - amount, this.y - amount, this.w + amount * 2, this.h + amount * 2);
        }
        clone() { return new AABB(this.x, this.y, this.w, this.h); }
    }

    class Circle {
        constructor(x, y, r) {
            this.x = x; this.y = y; this.r = r;
        }
        get center() { return new Vec2(this.x, this.y); }
        contains(px, py) {
            const dx = px - this.x, dy = py - this.y;
            return dx * dx + dy * dy <= this.r * this.r;
        }
        intersectsCircle(other) {
            const dx = other.x - this.x, dy = other.y - this.y;
            const r = this.r + other.r;
            return dx * dx + dy * dy <= r * r;
        }
        intersectsAABB(box) {
            const cx = Math.max(box.x, Math.min(this.x, box.x + box.w));
            const cy = Math.max(box.y, Math.min(this.y, box.y + box.h));
            const dx = this.x - cx, dy = this.y - cy;
            return dx * dx + dy * dy <= this.r * this.r;
        }
    }

    class Entity {
        constructor(id, x = 0, y = 0) {
            this.id = id;
            this.pos = new Vec2(x, y);
            this.vel = new Vec2();
            this.acc = new Vec2();
            this.rotation = 0;
            this.scale = 1;
            this.active = true;
            this.visible = true;
            this.tags = new Set();
            this.components = new Map();
            this.lifetime = -1;
            this.age = 0;
        }
        addComponent(name, data) {
            this.components.set(name, data);
            return this;
        }
        getComponent(name) { return this.components.get(name); }
        hasComponent(name) { return this.components.has(name); }
        removeComponent(name) { this.components.delete(name); }
        addTag(tag) { this.tags.add(tag); return this; }
        hasTag(tag) { return this.tags.has(tag); }
        update(dt) {
            this.vel = this.vel.add(this.acc.mul(dt));
            this.pos = this.pos.add(this.vel.mul(dt));
            this.age += dt;
            if (this.lifetime > 0 && this.age >= this.lifetime) {
                this.active = false;
            }
        }
        destroy() { this.active = false; }
    }

    class EntityManager {
        constructor() {
            this.entities = new Map();
            this.nextId = 1;
            this.toRemove = [];
        }
        create(x, y) {
            const id = this.nextId++;
            const e = new Entity(id, x, y);
            this.entities.set(id, e);
            return e;
        }
        get(id) { return this.entities.get(id); }
        remove(id) { this.toRemove.push(id); }
        update(dt) {
            for (const e of this.entities.values()) {
                if (e.active) e.update(dt);
                else this.toRemove.push(e.id);
            }
            for (const id of this.toRemove) this.entities.delete(id);
            this.toRemove.length = 0;
        }
        query(predicate) {
            const result = [];
            for (const e of this.entities.values()) {
                if (e.active && predicate(e)) result.push(e);
            }
            return result;
        }
        queryTag(tag) {
            return this.query(e => e.hasTag(tag));
        }
        clear() { this.entities.clear(); this.toRemove.length = 0; }
        get count() { return this.entities.size; }
    }

    class InputManager {
        constructor() {
            this.keys = new Map();
            this.keysJustPressed = new Set();
            this.keysJustReleased = new Set();
            this.mouse = { x: 0, y: 0, down: false, justPressed: false, justReleased: false };
            this._bound = false;
        }
        bind(target = window) {
            if (this._bound) return;
            target.addEventListener("keydown", e => {
                if (!this.keys.get(e.code)) this.keysJustPressed.add(e.code);
                this.keys.set(e.code, true);
            });
            target.addEventListener("keyup", e => {
                this.keys.set(e.code, false);
                this.keysJustReleased.add(e.code);
            });
            target.addEventListener("mousemove", e => {
                this.mouse.x = e.clientX;
                this.mouse.y = e.clientY;
            });
            target.addEventListener("mousedown", () => {
                if (!this.mouse.down) this.mouse.justPressed = true;
                this.mouse.down = true;
            });
            target.addEventListener("mouseup", () => {
                this.mouse.down = false;
                this.mouse.justReleased = true;
            });
            this._bound = true;
        }
        isDown(code) { return !!this.keys.get(code); }
        justPressed(code) { return this.keysJustPressed.has(code); }
        justReleased(code) { return this.keysJustReleased.has(code); }
        endFrame() {
            this.keysJustPressed.clear();
            this.keysJustReleased.clear();
            this.mouse.justPressed = false;
            this.mouse.justReleased = false;
        }
    }

    class Timer {
        constructor() {
            this.time = 0;
            this.scale = 1;
            this.paused = false;
        }
        update(rawDt) {
            if (!this.paused) this.time += rawDt * this.scale;
        }
        reset() { this.time = 0; }
    }

    class GameLoop {
        constructor(updateFn, renderFn) {
            this.updateFn = updateFn;
            this.renderFn = renderFn;
            this.running = false;
            this.lastTime = 0;
            this.accumulator = 0;
            this.timestep = 1 / 60;
            this.maxFrame = 0.25;
            this.rafId = null;
            this.fps = 0;
            this.frameCount = 0;
            this.fpsTimer = 0;
        }
        start() {
            if (this.running) return;
            this.running = true;
            this.lastTime = performance.now() / 1000;
            const loop = (now) => {
                if (!this.running) return;
                const time = now / 1000;
                let dt = time - this.lastTime;
                this.lastTime = time;
                if (dt > this.maxFrame) dt = this.maxFrame;
                this.accumulator += dt;
                this.fpsTimer += dt;
                this.frameCount++;
                if (this.fpsTimer >= 1) {
                    this.fps = this.frameCount;
                    this.frameCount = 0;
                    this.fpsTimer = 0;
                }
                while (this.accumulator >= this.timestep) {
                    this.updateFn(this.timestep);
                    this.accumulator -= this.timestep;
                }
                this.renderFn(this.accumulator / this.timestep);
                this.rafId = requestAnimationFrame(loop);
            };
            this.rafId = requestAnimationFrame(loop);
        }
        stop() {
            this.running = false;
            if (this.rafId) cancelAnimationFrame(this.rafId);
        }
    }

    class Particle {
        constructor(x, y) {
            this.pos = new Vec2(x, y);
            this.vel = new Vec2();
            this.life = 1;
            this.maxLife = 1;
            this.size = 4;
            this.color = "#ffffff";
            this.alpha = 1;
            this.gravity = 0;
            this.friction = 1;
            this.active = true;
        }
        update(dt) {
            this.vel.y += this.gravity * dt;
            this.vel = this.vel.mul(this.friction);
            this.pos = this.pos.add(this.vel.mul(dt));
            this.life -= dt;
            this.alpha = Math.max(0, this.life / this.maxLife);
            if (this.life <= 0) this.active = false;
        }
    }

    class ParticleSystem {
        constructor(maxParticles = 500) {
            this.particles = [];
            this.maxParticles = maxParticles;
        }
        emit(x, y, count, config = {}) {
            for (let i = 0; i < count; i++) {
                if (this.particles.length >= this.maxParticles) break;
                const p = new Particle(x, y);
                const angle = config.angle !== undefined ? config.angle : Math.random() * Math.PI * 2;
                const speed = (config.speed || 100) * (0.5 + Math.random() * 0.5);
                p.vel = Vec2.fromAngle(angle, speed);
                p.life = p.maxLife = config.life || 0.5 + Math.random() * 0.5;
                p.size = config.size || 2 + Math.random() * 4;
                p.color = config.color || "#ffffff";
                p.gravity = config.gravity || 0;
                p.friction = config.friction || 0.98;
                this.particles.push(p);
            }
        }
        update(dt) {
            for (let i = this.particles.length - 1; i >= 0; i--) {
                this.particles[i].update(dt);
                if (!this.particles[i].active) this.particles.splice(i, 1);
            }
        }
        draw(ctx) {
            for (const p of this.particles) {
                ctx.globalAlpha = p.alpha;
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.pos.x, p.pos.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalAlpha = 1;
        }
        clear() { this.particles.length = 0; }
        get count() { return this.particles.length; }
    }

    // Export
    const Engine = {
        MODULE_ID, MODULE_NAME,
        Vec2, AABB, Circle, Entity, EntityManager,
        InputManager, Timer, GameLoop, Particle, ParticleSystem,
    };

    if (typeof module !== "undefined" && module.exports) {
        module.exports = Engine;
    } else {
        global.GameEngine = global.GameEngine || {};
        global.GameEngine[MODULE_NAME] = Engine;
    }
})(typeof window !== "undefined" ? window : globalThis);
