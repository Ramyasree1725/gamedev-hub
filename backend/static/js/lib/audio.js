
/**
 * GameDev Hub - Audio Manager
 * Web Audio API wrapper for sound effects and music.
 */
(function (global) {
    "use strict";

    class AudioManager {
        constructor() {
            this.ctx = null;
            this.masterGain = null;
            this.sfxGain = null;
            this.musicGain = null;
            this.buffers = new Map();
            this.musicSource = null;
            this.enabled = true;
            this.unlocked = false;
        }

        async init() {
            if (this.ctx) return;
            const AC = window.AudioContext || window.webkitAudioContext;
            if (!AC) return;
            this.ctx = new AC();
            this.masterGain = this.ctx.createGain();
            this.sfxGain = this.ctx.createGain();
            this.musicGain = this.ctx.createGain();
            this.sfxGain.connect(this.masterGain);
            this.musicGain.connect(this.masterGain);
            this.masterGain.connect(this.ctx.destination);
            this.masterGain.gain.value = 0.8;
            this.sfxGain.gain.value = 1.0;
            this.musicGain.gain.value = 0.5;
        }

        async unlock() {
            if (!this.ctx) await this.init();
            if (this.ctx && this.ctx.state === "suspended") {
                await this.ctx.resume();
            }
            this.unlocked = true;
        }

        async load(name, url) {
            if (!this.ctx) await this.init();
            if (!this.ctx) return;
            try {
                const res = await fetch(url);
                const arr = await res.arrayBuffer();
                const buf = await this.ctx.decodeAudioData(arr);
                this.buffers.set(name, buf);
            } catch (e) {
                console.warn("Audio load failed:", name, e);
            }
        }

        play(name, opts = {}) {
            if (!this.enabled || !this.ctx || !this.unlocked) return null;
            const buf = this.buffers.get(name);
            if (!buf) return null;
            const src = this.ctx.createBufferSource();
            src.buffer = buf;
            const gain = this.ctx.createGain();
            gain.gain.value = opts.volume !== undefined ? opts.volume : 1;
            src.connect(gain);
            gain.connect(opts.music ? this.musicGain : this.sfxGain);
            if (opts.loop) src.loop = true;
            src.start(0);
            return src;
        }

        playTone(freq, duration, type = "square", volume = 0.1) {
            if (!this.enabled || !this.ctx || !this.unlocked) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = type;
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(volume, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start();
            osc.stop(this.ctx.currentTime + duration);
        }

        // Procedural SFX
        playEat() { this.playTone(440, 0.08, "square", 0.08); this.playTone(660, 0.06, "square", 0.06); }
        playHit() { this.playTone(150, 0.15, "sawtooth", 0.12); }
        playWin() {
            [523, 659, 784, 1047].forEach((f, i) => {
                setTimeout(() => this.playTone(f, 0.2, "sine", 0.1), i * 120);
            });
        }
        playClick() { this.playTone(800, 0.04, "square", 0.05); }

        setMasterVolume(v) {
            if (this.masterGain) this.masterGain.gain.value = Math.max(0, Math.min(1, v));
        }
        setMuted(muted) { this.enabled = !muted; }
    }

    const audio = new AudioManager();
    if (typeof module !== "undefined" && module.exports) {
        module.exports = audio;
    } else {
        global.GDHAudio = audio;
    }
})(typeof window !== "undefined" ? window : globalThis);
