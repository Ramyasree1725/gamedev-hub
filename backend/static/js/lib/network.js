
/**
 * GameDev Hub - Network / API client
 */
(function (global) {
    "use strict";

    const BASE = "";

    async function request(path, options = {}) {
        const opts = {
            headers: { "Content-Type": "application/json", ...(options.headers || {}) },
            ...options,
        };
        if (opts.body && typeof opts.body === "object") {
            opts.body = JSON.stringify(opts.body);
        }
        const res = await fetch(BASE + path, opts);
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            const err = new Error(data.error || res.statusText);
            err.status = res.status;
            err.data = data;
            throw err;
        }
        return data;
    }

    const api = {
        getGames: () => request("/api/games"),
        getLeaderboard: (gameId) => request("/api/leaderboard/" + gameId),
        getAllLeaderboards: () => request("/api/leaderboard"),
        submitScore: (game, name, score) =>
            request("/api/score", { method: "POST", body: { game, name, score } }),
        health: () => request("/api/health"),

        // Extended endpoints (routes modules)
        list: (module, params = {}) => {
            const qs = new URLSearchParams(params).toString();
            return request("/api/" + module + "/" + (qs ? "?" + qs : ""));
        },
        create: (module, data) =>
            request("/api/" + module + "/", { method: "POST", body: data }),
        get: (module, id) => request("/api/" + module + "/" + id),
        update: (module, id, data) =>
            request("/api/" + module + "/" + id, { method: "PUT", body: data }),
        remove: (module, id) =>
            request("/api/" + module + "/" + id, { method: "DELETE" }),
        stats: (module) => request("/api/" + module + "/stats"),
        search: (module, q) => request("/api/" + module + "/search?q=" + encodeURIComponent(q)),
    };

    if (typeof module !== "undefined" && module.exports) {
        module.exports = api;
    } else {
        global.GDHApi = api;
    }
})(typeof window !== "undefined" ? window : globalThis);
