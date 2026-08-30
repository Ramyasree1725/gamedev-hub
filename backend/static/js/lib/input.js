
/**
 * GameDev Hub - Unified Input Manager
 * Keyboard, mouse, touch, and gamepad abstraction.
 */
(function (global) {
    "use strict";

    class InputManager {
        constructor() {
            this.keys = new Map();
            this.justPressed = new Set();
            this.justReleased = new Set();
            this.mouse = { x: 0, y: 0, down: false, justPressed: false, justReleased: false, button: 0 };
            this.touches = [];
            this.gamepadIndex = null;
            this.bindings = new Map();
            this._bound = false;
        }

        bind(el) {
            if (this._bound) return;
            el = el || window;
            el.addEventListener("keydown", e => {
                if (!this.keys.get(e.code)) this.justPressed.add(e.code);
                this.keys.set(e.code, true);
            });
            el.addEventListener("keyup", e => {
                this.keys.set(e.code, false);
                this.justReleased.add(e.code);
            });
            el.addEventListener("mousemove", e => {
                this.mouse.x = e.clientX;
                this.mouse.y = e.clientY;
            });
            el.addEventListener("mousedown", e => {
                if (!this.mouse.down) this.mouse.justPressed = true;
                this.mouse.down = true;
                this.mouse.button = e.button;
            });
            el.addEventListener("mouseup", e => {
                this.mouse.down = false;
                this.mouse.justReleased = true;
            });
            el.addEventListener("touchstart", e => {
                this.touches = Array.from(e.touches).map(t => ({ id: t.identifier, x: t.clientX, y: t.clientY }));
                if (!this.mouse.down) this.mouse.justPressed = true;
                this.mouse.down = true;
            }, { passive: true });
            el.addEventListener("touchmove", e => {
                this.touches = Array.from(e.touches).map(t => ({ id: t.identifier, x: t.clientX, y: t.clientY }));
                if (this.touches[0]) {
                    this.mouse.x = this.touches[0].x;
                    this.mouse.y = this.touches[0].y;
                }
            }, { passive: true });
            el.addEventListener("touchend", e => {
                this.touches = Array.from(e.touches).map(t => ({ id: t.identifier, x: t.clientX, y: t.clientY }));
                if (this.touches.length === 0) {
                    this.mouse.down = false;
                    this.mouse.justReleased = true;
                }
            }, { passive: true });
            this._bound = true;
        }

        isDown(code) { return !!this.keys.get(code); }
        pressed(code) { return this.justPressed.has(code); }
        released(code) { return this.justReleased.has(code); }

        // Action bindings
        mapAction(action, codes) {
            this.bindings.set(action, Array.isArray(codes) ? codes : [codes]);
        }
        actionDown(action) {
            const codes = this.bindings.get(action) || [];
            return codes.some(c => this.isDown(c));
        }
        actionPressed(action) {
            const codes = this.bindings.get(action) || [];
            return codes.some(c => this.pressed(c));
        }

        // Default game bindings
        setupGameDefaults() {
            this.mapAction("left", ["ArrowLeft", "KeyA"]);
            this.mapAction("right", ["ArrowRight", "KeyD"]);
            this.mapAction("up", ["ArrowUp", "KeyW"]);
            this.mapAction("down", ["ArrowDown", "KeyS"]);
            this.mapAction("action", ["Space", "Enter"]);
            this.mapAction("pause", ["KeyP", "Escape"]);
        }

        pollGamepad() {
            const pads = navigator.getGamepads ? navigator.getGamepads() : [];
            for (const pad of pads) {
                if (!pad) continue;
                this.gamepadIndex = pad.index;
                // Map d-pad / left stick to actions
                const lx = pad.axes[0] || 0;
                const ly = pad.axes[1] || 0;
                if (lx < -0.4) this.keys.set("ArrowLeft", true);
                if (lx > 0.4) this.keys.set("ArrowRight", true);
                if (ly < -0.4) this.keys.set("ArrowUp", true);
                if (ly > 0.4) this.keys.set("ArrowDown", true);
                if (pad.buttons[0] && pad.buttons[0].pressed) this.keys.set("Space", true);
                break;
            }
        }

        endFrame() {
            this.justPressed.clear();
            this.justReleased.clear();
            this.mouse.justPressed = false;
            this.mouse.justReleased = false;
        }
    }

    const input = new InputManager();
    if (typeof module !== "undefined" && module.exports) {
        module.exports = input;
    } else {
        global.GDHInput = input;
    }
})(typeof window !== "undefined" ? window : globalThis);
