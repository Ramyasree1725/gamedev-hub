
/**
 * GameDev Hub Engine Extension Module 34
 * Additional systems: audio, tween, state machine, tilemap helpers.
 */
(function (global) {
    "use strict";
    const MODULE_ID = 34;

    class Tween {
        constructor(target, props, duration, easing) {
            this.target = target;
            this.props = props;
            this.duration = duration;
            this.easing = easing || (t => t);
            this.elapsed = 0;
            this.startVals = {};
            this.done = false;
            this.onComplete = null;
            for (const k of Object.keys(props)) {
                this.startVals[k] = target[k];
            }
        }
        update(dt) {
            if (this.done) return;
            this.elapsed += dt;
            const t = Math.min(1, this.elapsed / this.duration);
            const e = this.easing(t);
            for (const k of Object.keys(this.props)) {
                this.target[k] = this.startVals[k] + (this.props[k] - this.startVals[k]) * e;
            }
            if (t >= 1) {
                this.done = true;
                if (this.onComplete) this.onComplete();
            }
        }
    }

    class TweenManager {
        constructor() { this.tweens = []; }
        add(tween) { this.tweens.push(tween); return tween; }
        to(target, props, duration, easing) {
            const t = new Tween(target, props, duration, easing);
            this.tweens.push(t);
            return t;
        }
        update(dt) {
            for (let i = this.tweens.length - 1; i >= 0; i--) {
                this.tweens[i].update(dt);
                if (this.tweens[i].done) this.tweens.splice(i, 1);
            }
        }
        clear() { this.tweens.length = 0; }
    }

    class StateMachine {
        constructor() {
            this.states = new Map();
            this.current = null;
            this.previous = null;
        }
        add(name, state) {
            this.states.set(name, state);
            return this;
        }
        start(name) {
            this.current = name;
            const s = this.states.get(name);
            if (s && s.enter) s.enter();
        }
        transition(name) {
            if (this.current === name) return;
            const prev = this.states.get(this.current);
            if (prev && prev.exit) prev.exit();
            this.previous = this.current;
            this.current = name;
            const next = this.states.get(name);
            if (next && next.enter) next.enter();
        }
        update(dt) {
            const s = this.states.get(this.current);
            if (s && s.update) s.update(dt);
        }
    }

    class TileMap {
        constructor(cols, rows, tileSize) {
            this.cols = cols;
            this.rows = rows;
            this.tileSize = tileSize;
            this.data = new Array(cols * rows).fill(0);
        }
        index(x, y) { return y * this.cols + x; }
        get(x, y) {
            if (x < 0 || y < 0 || x >= this.cols || y >= this.rows) return -1;
            return this.data[this.index(x, y)];
        }
        set(x, y, value) {
            if (x < 0 || y < 0 || x >= this.cols || y >= this.rows) return;
            this.data[this.index(x, y)] = value;
        }
        fill(value) { this.data.fill(value); }
        forEach(fn) {
            for (let y = 0; y < this.rows; y++) {
                for (let x = 0; x < this.cols; x++) {
                    fn(x, y, this.get(x, y));
                }
            }
        }
        worldToTile(wx, wy) {
            return [Math.floor(wx / this.tileSize), Math.floor(wy / this.tileSize)];
        }
        tileToWorld(tx, ty) {
            return [tx * this.tileSize, ty * this.tileSize];
        }
    }

    class AudioBus {
        constructor() {
            this.sounds = new Map();
            this.volume = 1;
            this.muted = false;
        }
        register(name, audio) { this.sounds.set(name, audio); }
        play(name, opts = {}) {
            if (this.muted) return;
            const a = this.sounds.get(name);
            if (!a) return;
            const clone = a.cloneNode ? a.cloneNode() : a;
            clone.volume = (opts.volume !== undefined ? opts.volume : 1) * this.volume;
            clone.loop = !!opts.loop;
            clone.play().catch(() => {});
        }
        setVolume(v) { this.volume = Math.max(0, Math.min(1, v)); }
        mute() { this.muted = true; }
        unmute() { this.muted = false; }
    }

    class Camera {
        constructor(w, h) {
            this.x = 0; this.y = 0;
            this.w = w; this.h = h;
            this.zoom = 1;
            this.target = null;
            this.lerp = 0.1;
            this.bounds = null;
        }
        follow(entity) { this.target = entity; }
        update() {
            if (this.target) {
                const tx = this.target.x - this.w / (2 * this.zoom);
                const ty = this.target.y - this.h / (2 * this.zoom);
                this.x += (tx - this.x) * this.lerp;
                this.y += (ty - this.y) * this.lerp;
            }
            if (this.bounds) {
                this.x = Math.max(this.bounds.x, Math.min(this.x, this.bounds.x + this.bounds.w - this.w / this.zoom));
                this.y = Math.max(this.bounds.y, Math.min(this.y, this.bounds.y + this.bounds.h - this.h / this.zoom));
            }
        }
        apply(ctx) {
            ctx.save();
            ctx.scale(this.zoom, this.zoom);
            ctx.translate(-this.x, -this.y);
        }
        restore(ctx) { ctx.restore(); }
        screenToWorld(sx, sy) {
            return [sx / this.zoom + this.x, sy / this.zoom + this.y];
        }
    }

    const Ext = {
        MODULE_ID, Tween, TweenManager, StateMachine, TileMap, AudioBus, Camera
    };

    if (typeof module !== "undefined" && module.exports) {
        module.exports = Ext;
    } else {
        global.GameEngine = global.GameEngine || {};
        global.GameEngine["ext_" + MODULE_ID] = Ext;
    }
})(typeof window !== "undefined" ? window : globalThis);
