/**
 * GameDev Hub - Main Frontend Script
 * Handles navigation, common UI interactions
 */

document.addEventListener('DOMContentLoaded', () => {
    // Mobile nav toggle
    const toggle = document.getElementById('navToggle');
    const links = document.getElementById('navLinks');

    if (toggle && links) {
        toggle.addEventListener('click', () => {
            links.classList.toggle('open');
            toggle.classList.toggle('open');
        });

        // Close menu when a link is clicked
        links.querySelectorAll('a').forEach(a => {
            a.addEventListener('click', () => {
                links.classList.remove('open');
                toggle.classList.remove('open');
            });
        });
    }

    // Smooth scroll for any internal anchors
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // Highlight active nav based on path (fallback)
    const path = window.location.pathname;
    document.querySelectorAll('.nav-links a').forEach(a => {
        if (a.getAttribute('href') === path) {
            a.classList.add('active');
        }
    });

    console.log('%cGameDev Hub loaded', 'color: #7c5cfc; font-weight: bold; font-size: 14px;');
});

/**
 * Shared helper for score submission used by all games
 */
async function submitScoreToServer(gameId, name, score) {
    try {
        const res = await fetch('/api/score', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ game: gameId, name, score })
        });
        const data = await res.json();
        return data;
    } catch (err) {
        console.error('Score submit failed', err);
        return { error: 'Network error' };
    }
}
