
/**
 * GameDev Hub Utility Library - utils_17
 * Shared helpers for games and UI.
 * Module: 17
 */
(function (global) {
    "use strict";
    const ID = 17;

    function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
    function lerp(a, b, t) { return a + (b - a) * clamp(t, 0, 1); }
    function map(v, inMin, inMax, outMin, outMax) {
        return outMin + (outMax - outMin) * ((v - inMin) / (inMax - inMin || 1));
    }
    function randomRange(min, max) { return min + Math.random() * (max - min); }
    function randomInt(min, max) { return Math.floor(randomRange(min, max + 1)); }
    function choice(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
    function shuffle(arr) {
        const a = arr.slice();
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }
    function degToRad(d) { return d * Math.PI / 180; }
    function radToDeg(r) { return r * 180 / Math.PI; }
    function wrap(v, min, max) {
        const range = max - min;
        return ((((v - min) % range) + range) % range) + min;
    }
    function smoothstep(e0, e1, x) {
        const t = clamp((x - e0) / (e1 - e0), 0, 1);
        return t * t * (3 - 2 * t);
    }
    function colorLerp(c1, c2, t) {
        // Simple hex lerp (assumes #rrggbb)
        const parse = c => ({
            r: parseInt(c.slice(1, 3), 16),
            g: parseInt(c.slice(3, 5), 16),
            b: parseInt(c.slice(5, 7), 16)
        });
        const a = parse(c1), b = parse(c2);
        const r = Math.round(lerp(a.r, b.r, t));
        const g = Math.round(lerp(a.g, b.g, t));
        const bl = Math.round(lerp(a.b, b.b, t));
        return "#" + [r, g, bl].map(x => x.toString(16).padStart(2, "0")).join("");
    }
    function formatNumber(n) {
        return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    function debounce(fn, wait) {
        let t;
        return function (...args) {
            clearTimeout(t);
            t = setTimeout(() => fn.apply(this, args), wait);
        };
    }
    function throttle(fn, limit) {
        let inThrottle;
        return function (...args) {
            if (!inThrottle) {
                fn.apply(this, args);
                inThrottle = true;
                setTimeout(() => (inThrottle = false), limit);
            }
        };
    }
    function deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }
    function uuid() {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
            const r = (Math.random() * 16) | 0;
            const v = c === "x" ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }
    function storageGet(key, fallback) {
        try {
            const v = localStorage.getItem(key);
            return v !== null ? JSON.parse(v) : fallback;
        } catch { return fallback; }
    }
    function storageSet(key, value) {
        try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
    }
    function loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    }
    function loadAudio(src) {
        return new Promise((resolve, reject) => {
            const a = new Audio();
            a.oncanplaythrough = () => resolve(a);
            a.onerror = reject;
            a.src = src;
        });
    }
    // Grid helpers
    function createGrid(cols, rows, fill = 0) {
        return Array.from({ length: rows }, () => Array(cols).fill(fill));
    }
    function gridNeighbors(x, y, cols, rows, diagonal = false) {
        const dirs = diagonal
            ? [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]
            : [[-1,0],[1,0],[0,-1],[0,1]];
        return dirs
            .map(([dx, dy]) => [x + dx, y + dy])
            .filter(([nx, ny]) => nx >= 0 && nx < cols && ny >= 0 && ny < rows);
    }
    // Easing functions
    const Easing = {
        linear: t => t,
        easeInQuad: t => t * t,
        easeOutQuad: t => t * (2 - t),
        easeInOutQuad: t => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
        easeInCubic: t => t * t * t,
        easeOutCubic: t => (--t) * t * t + 1,
        easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
        easeInElastic: t => {
            if (t === 0 || t === 1) return t;
            return -Math.pow(2, 10 * (t - 1)) * Math.sin((t - 1.1) * 5 * Math.PI);
        },
        easeOutElastic: t => {
            if (t === 0 || t === 1) return t;
            return Math.pow(2, -10 * t) * Math.sin((t - 0.1) * 5 * Math.PI) + 1;
        },
        easeInBounce: t => 1 - Easing.easeOutBounce(1 - t),
        easeOutBounce: t => {
            if (t < 1 / 2.75) return 7.5625 * t * t;
            if (t < 2 / 2.75) return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
            if (t < 2.5 / 2.75) return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
            return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
        },
    };

    const API = {
        ID, clamp, lerp, map, randomRange, randomInt, choice, shuffle,
        degToRad, radToDeg, wrap, smoothstep, colorLerp, formatNumber,
        debounce, throttle, deepClone, uuid, storageGet, storageSet,
        loadImage, loadAudio, createGrid, gridNeighbors, Easing,
    };

    if (typeof module !== "undefined" && module.exports) {
        module.exports = API;
    } else {
        global.GDHUtils = global.GDHUtils || {};
        global.GDHUtils["utils_17"] = API;
    }
})(typeof window !== "undefined" ? window : globalThis);
