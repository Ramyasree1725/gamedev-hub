
/**
 * GameDev Hub UI Component Library - ui_11
 * Reusable UI widgets for the game portal.
 */
(function (global) {
    "use strict";
    const MOD = "ui_11";

    class Button {
        constructor(label, x, y, w, h, onClick) {
            this.label = label;
            this.x = x; this.y = y; this.w = w; this.h = h;
            this.onClick = onClick;
            this.hover = false;
            this.disabled = false;
            this.bg = "#7c5cfc";
            this.bgHover = "#9b82ff";
            this.fg = "#ffffff";
            this.radius = 8;
        }
        contains(mx, my) {
            return mx >= this.x && mx <= this.x + this.w && my >= this.y && my <= this.y + this.h;
        }
        update(mx, my) {
            this.hover = !this.disabled && this.contains(mx, my);
        }
        click(mx, my) {
            if (!this.disabled && this.contains(mx, my) && this.onClick) this.onClick();
        }
        draw(ctx) {
            ctx.fillStyle = this.disabled ? "#444" : (this.hover ? this.bgHover : this.bg);
            this.roundRect(ctx, this.x, this.y, this.w, this.h, this.radius);
            ctx.fill();
            ctx.fillStyle = this.fg;
            ctx.font = "16px Inter, sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(this.label, this.x + this.w / 2, this.y + this.h / 2);
        }
        roundRect(ctx, x, y, w, h, r) {
            ctx.beginPath();
            ctx.moveTo(x + r, y);
            ctx.arcTo(x + w, y, x + w, y + h, r);
            ctx.arcTo(x + w, y + h, x, y + h, r);
            ctx.arcTo(x, y + h, x, y, r);
            ctx.arcTo(x, y, x + w, y, r);
            ctx.closePath();
        }
    }

    class ProgressBar {
        constructor(x, y, w, h) {
            this.x = x; this.y = y; this.w = w; this.h = h;
            this.value = 0;
            this.max = 100;
            this.bg = "#1a1a24";
            this.fill = "#4ade80";
            this.radius = 4;
        }
        set(value) { this.value = Math.max(0, Math.min(this.max, value)); }
        draw(ctx) {
            const pct = this.value / this.max;
            ctx.fillStyle = this.bg;
            this.roundRect(ctx, this.x, this.y, this.w, this.h, this.radius);
            ctx.fill();
            if (pct > 0) {
                ctx.fillStyle = this.fill;
                this.roundRect(ctx, this.x, this.y, this.w * pct, this.h, this.radius);
                ctx.fill();
            }
        }
        roundRect(ctx, x, y, w, h, r) {
            ctx.beginPath();
            ctx.moveTo(x + r, y);
            ctx.arcTo(x + w, y, x + w, y + h, r);
            ctx.arcTo(x + w, y + h, x, y + h, r);
            ctx.arcTo(x, y + h, x, y, r);
            ctx.arcTo(x, y, x + w, y, r);
            ctx.closePath();
        }
    }

    class Label {
        constructor(text, x, y, options = {}) {
            this.text = text;
            this.x = x; this.y = y;
            this.font = options.font || "16px Inter, sans-serif";
            this.color = options.color || "#e8e8f0";
            this.align = options.align || "left";
            this.baseline = options.baseline || "top";
        }
        draw(ctx) {
            ctx.fillStyle = this.color;
            ctx.font = this.font;
            ctx.textAlign = this.align;
            ctx.textBaseline = this.baseline;
            ctx.fillText(this.text, this.x, this.y);
        }
    }

    class Panel {
        constructor(x, y, w, h) {
            this.x = x; this.y = y; this.w = w; this.h = h;
            this.bg = "#1a1a24";
            this.border = "#2e2e3e";
            this.radius = 12;
            this.children = [];
        }
        add(child) { this.children.push(child); }
        draw(ctx) {
            ctx.fillStyle = this.bg;
            ctx.strokeStyle = this.border;
            ctx.lineWidth = 1;
            this.roundRect(ctx, this.x, this.y, this.w, this.h, this.radius);
            ctx.fill();
            ctx.stroke();
            for (const c of this.children) if (c.draw) c.draw(ctx);
        }
        roundRect(ctx, x, y, w, h, r) {
            ctx.beginPath();
            ctx.moveTo(x + r, y);
            ctx.arcTo(x + w, y, x + w, y + h, r);
            ctx.arcTo(x + w, y + h, x, y + h, r);
            ctx.arcTo(x, y + h, x, y, r);
            ctx.arcTo(x, y, x + w, y, r);
            ctx.closePath();
        }
    }

    class Modal {
        constructor(title, content) {
            this.title = title;
            this.content = content;
            this.visible = false;
            this.onClose = null;
        }
        show() { this.visible = true; }
        hide() { this.visible = false; if (this.onClose) this.onClose(); }
        draw(ctx, canvasW, canvasH) {
            if (!this.visible) return;
            ctx.fillStyle = "rgba(0,0,0,0.7)";
            ctx.fillRect(0, 0, canvasW, canvasH);
            const mw = 400, mh = 250;
            const mx = (canvasW - mw) / 2, my = (canvasH - mh) / 2;
            ctx.fillStyle = "#1a1a24";
            ctx.strokeStyle = "#7c5cfc";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.roundRect(mx, my, mw, mh, 12);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = "#fff";
            ctx.font = "bold 20px Orbitron, sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(this.title, canvasW / 2, my + 40);
            ctx.font = "14px Inter, sans-serif";
            ctx.fillStyle = "#9898b0";
            ctx.fillText(this.content, canvasW / 2, my + 100);
        }
    }

    class Toast {
        constructor() {
            this.messages = [];
        }
        show(text, duration = 3000) {
            this.messages.push({ text, life: duration, max: duration });
        }
        update(dt) {
            for (let i = this.messages.length - 1; i >= 0; i--) {
                this.messages[i].life -= dt * 1000;
                if (this.messages[i].life <= 0) this.messages.splice(i, 1);
            }
        }
        draw(ctx, canvasW) {
            let y = 20;
            for (const m of this.messages) {
                const alpha = Math.min(1, m.life / 500);
                ctx.globalAlpha = alpha;
                ctx.fillStyle = "#22222e";
                ctx.strokeStyle = "#7c5cfc";
                const tw = ctx.measureText(m.text).width + 40;
                const x = canvasW - tw - 20;
                ctx.beginPath();
                ctx.roundRect(x, y, tw, 36, 8);
                ctx.fill();
                ctx.stroke();
                ctx.fillStyle = "#e8e8f0";
                ctx.font = "14px Inter, sans-serif";
                ctx.textAlign = "center";
                ctx.fillText(m.text, x + tw / 2, y + 22);
                ctx.globalAlpha = 1;
                y += 48;
            }
        }
    }

    const UI = { Button, ProgressBar, Label, Panel, Modal, Toast, MOD };
    if (typeof module !== "undefined" && module.exports) {
        module.exports = UI;
    } else {
        global.GDHUI = global.GDHUI || {};
        global.GDHUI[MOD] = UI;
    }
})(typeof window !== "undefined" ? window : globalThis);
