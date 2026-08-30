
/**
 * GameDev Hub - Math helpers for games
 */
(function (global) {
    "use strict";

    function clamp(v, min, max) {
        return Math.max(min, Math.min(max, v));
    }

    function lerp(a, b, t) {
        return a + (b - a) * clamp(t, 0, 1);
    }

    function map(v, inMin, inMax, outMin, outMax) {
        return outMin + (outMax - outMin) * ((v - inMin) / ((inMax - inMin) || 1));
    }

    function dist(x1, y1, x2, y2) {
        const dx = x2 - x1, dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }

    function distSq(x1, y1, x2, y2) {
        const dx = x2 - x1, dy = y2 - y1;
        return dx * dx + dy * dy;
    }

    function randomRange(min, max) {
        return min + Math.random() * (max - min);
    }

    function randomInt(min, max) {
        return Math.floor(randomRange(min, max + 1));
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

    const API = {
        clamp, lerp, map, dist, distSq, randomRange, randomInt,
        degToRad, radToDeg, wrap, smoothstep,
    };

    if (typeof module !== "undefined" && module.exports) {
        module.exports = API;
    } else {
        global.GDHMath = API;
    }
})(typeof window !== "undefined" ? window : globalThis);
