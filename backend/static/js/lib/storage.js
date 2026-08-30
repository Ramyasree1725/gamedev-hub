
/**
 * GameDev Hub - Persistent Storage Helper
 * localStorage wrapper with namespacing, quotas, and migration.
 */
(function (global) {
    "use strict";

    const PREFIX = "gdh_";
    const VERSION_KEY = PREFIX + "schema_version";
    const CURRENT_VERSION = 1;

    class Storage {
        constructor(namespace = "default") {
            this.ns = PREFIX + namespace + "_";
        }

        _k(key) { return this.ns + key; }

        get(key, fallback = null) {
            try {
                const raw = localStorage.getItem(this._k(key));
                if (raw === null) return fallback;
                return JSON.parse(raw);
            } catch {
                return fallback;
            }
        }

        set(key, value) {
            try {
                localStorage.setItem(this._k(key), JSON.stringify(value));
                return true;
            } catch (e) {
                console.warn("Storage set failed", e);
                return false;
            }
        }

        remove(key) {
            localStorage.removeItem(this._k(key));
        }

        clear() {
            const keys = [];
            for (let i = 0; i < localStorage.length; i++) {
                const k = localStorage.key(i);
                if (k && k.startsWith(this.ns)) keys.push(k);
            }
            keys.forEach(k => localStorage.removeItem(k));
        }

        keys() {
            const result = [];
            for (let i = 0; i < localStorage.length; i++) {
                const k = localStorage.key(i);
                if (k && k.startsWith(this.ns)) result.push(k.slice(this.ns.length));
            }
            return result;
        }

        // High scores helpers
        getHighScore(gameId) {
            return this.get("high_" + gameId, 0);
        }

        setHighScore(gameId, score) {
            const current = this.getHighScore(gameId);
            if (score > current) {
                this.set("high_" + gameId, score);
                return true;
            }
            return false;
        }

        getSettings() {
            return this.get("settings", {
                sound: true,
                music: true,
                difficulty: "medium",
                showFps: false,
            });
        }

        saveSettings(settings) {
            this.set("settings", settings);
        }
    }

    function migrate() {
        const ver = parseInt(localStorage.getItem(VERSION_KEY) || "0", 10);
        if (ver < CURRENT_VERSION) {
            // Future migrations go here
            localStorage.setItem(VERSION_KEY, String(CURRENT_VERSION));
        }
    }

    migrate();

    const storage = {
        game: new Storage("game"),
        user: new Storage("user"),
        cache: new Storage("cache"),
        Storage,
    };

    if (typeof module !== "undefined" && module.exports) {
        module.exports = storage;
    } else {
        global.GDHStorage = storage;
    }
})(typeof window !== "undefined" ? window : globalThis);
