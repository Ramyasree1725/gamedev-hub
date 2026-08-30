"""
GameDev Hub - A full-stack game development portal
Features: Multiple mini-games, leaderboard, tutorials, score submission API
"""

from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from flask_cors import CORS
from datetime import datetime
import json
import os
import hashlib
import random
import string

app = Flask(__name__, static_folder='static', template_folder='templates')
app.secret_key = 'gamedev-hub-secret-key-2026-medha-project'
CORS(app)

# In-memory data store (for simplicity; in production use database)
LEADERBOARD = {
    'snake': [],
    'tictactoe': [],
    'memory': [],
    'breakout': [],
    'pong': []
}

GAMES_INFO = [
    {
        'id': 'snake',
        'name': 'Classic Snake',
        'description': 'The timeless snake game. Eat food, grow longer, avoid walls and yourself.',
        'difficulty': 'Easy',
        'controls': 'Arrow Keys or WASD',
        'color': '#4ade80',
        'icon': '🐍'
    },
    {
        'id': 'tictactoe',
        'name': 'Tic Tac Toe',
        'description': 'Classic X and O. Play against AI or a friend in local multiplayer.',
        'difficulty': 'Easy',
        'controls': 'Mouse Click',
        'color': '#60a5fa',
        'icon': '❌'
    },
    {
        'id': 'memory',
        'name': 'Memory Match',
        'description': 'Flip cards and find matching pairs. Test your memory skills!',
        'difficulty': 'Medium',
        'controls': 'Mouse Click',
        'color': '#f472b6',
        'icon': '🧠'
    },
    {
        'id': 'breakout',
        'name': 'Breakout',
        'description': 'Break all the bricks with the ball. Classic arcade action!',
        'difficulty': 'Medium',
        'controls': 'Left/Right Arrow or Mouse',
        'color': '#fbbf24',
        'icon': '🧱'
    },
    {
        'id': 'pong',
        'name': 'Pong',
        'description': 'The original arcade classic. Beat the AI or play with a friend.',
        'difficulty': 'Hard',
        'controls': 'W/S or Arrow Keys',
        'color': '#a78bfa',
        'icon': '🏓'
    }
]

TUTORIALS = [
    {
        'id': 1,
        'title': 'Introduction to Game Development',
        'category': 'Beginner',
        'content': '''
Game development is the art and science of creating interactive entertainment experiences.
It combines programming, art, design, audio, and storytelling.

Key concepts you will learn:
1. Game Loop - The continuous cycle of input, update, and render.
2. Collision Detection - Detecting when objects touch each other.
3. Physics Simulation - Gravity, velocity, acceleration.
4. State Management - Tracking game states (menu, playing, paused, game over).
5. Asset Management - Loading and using images, sounds, and fonts.

In this portal we use pure JavaScript for games so you can see every line of code.
No heavy engines required for these mini-games. Understanding the fundamentals
is the best way to become a strong game developer.
        '''
    },
    {
        'id': 2,
        'title': 'Building a Snake Game from Scratch',
        'category': 'Intermediate',
        'content': '''
The Snake game is perfect for learning core game programming concepts.

Core data structures:
- snake: Array of {x, y} segments
- food: {x, y} position
- direction: current movement vector
- score: integer

Game loop (requestAnimationFrame or setInterval):
1. Process input (change direction, but prevent 180 degree turns)
2. Move the head based on direction
3. Check collisions with walls or self
4. Check if food was eaten -> grow + increase score + spawn new food
5. Render everything on canvas

Collision detection is simple grid-based for Snake.
Always keep the game loop clean and separate concerns:
- input handling
- game logic / update
- rendering

Try modifying the code: change speed, add obstacles, or power-ups!
        '''
    },
    {
        'id': 3,
        'title': 'Canvas API Deep Dive',
        'category': 'Intermediate',
        'content': '''
HTML5 Canvas is the foundation for 2D browser games.

Key methods:
- getContext('2d')
- fillRect, strokeRect, clearRect
- beginPath, moveTo, lineTo, arc, fill, stroke
- drawImage for sprites
- fillText for scores and UI

Performance tips:
- Avoid creating objects inside the loop when possible
- Use offscreen canvases for complex scenes
- Batch draw calls
- Use requestAnimationFrame for smooth 60fps

Coordinate system starts at top-left (0,0).
Always clear the canvas at the start of each frame unless doing trails.
        '''
    },
    {
        'id': 4,
        'title': 'Adding AI Opponents',
        'category': 'Advanced',
        'content': '''
Simple AI techniques used in our games:

Tic Tac Toe AI:
- Minimax algorithm (perfect play)
- Or random + block winning moves (easier)

Pong AI:
- Predict ball trajectory
- Move paddle toward predicted Y with some error for fairness

Memory / other:
- Pattern recognition or simple heuristics

Tips for fair AI:
- Add reaction delay
- Introduce intentional mistakes based on difficulty
- Never make AI perfect unless it is a challenge mode
        '''
    },
    {
        'id': 5,
        'title': 'Full Stack Score System',
        'category': 'Full Stack',
        'content': '''
Our backend uses Flask to receive scores via POST /api/score

Flow:
1. Game ends -> JS collects name + score + gameId
2. fetch('/api/score', { method: 'POST', body: JSON })
3. Backend validates, stores in leaderboard
4. Frontend can refresh leaderboard via GET /api/leaderboard/<game>

In production you would:
- Use a real database (PostgreSQL / MongoDB)
- Add authentication (JWT or sessions)
- Rate limit submissions
- Validate scores server-side to prevent cheating
        '''
    }
]

def generate_id():
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))

@app.route('/')
def index():
    return render_template('index.html', games=GAMES_INFO)

@app.route('/games')
def games_page():
    return render_template('games.html', games=GAMES_INFO)

@app.route('/game/<game_id>')
def play_game(game_id):
    game = next((g for g in GAMES_INFO if g['id'] == game_id), None)
    if not game:
        return redirect(url_for('games_page'))
    return render_template('play.html', game=game)

@app.route('/leaderboard')
def leaderboard_page():
    return render_template('leaderboard.html', games=GAMES_INFO, leaderboard=LEADERBOARD)

@app.route('/tutorials')
def tutorials_page():
    return render_template('tutorials.html', tutorials=TUTORIALS)

@app.route('/about')
def about_page():
    return render_template('about.html')

@app.route('/api/games')
def api_games():
    return jsonify(GAMES_INFO)

@app.route('/api/leaderboard')
def api_leaderboard_all():
    return jsonify(LEADERBOARD)

@app.route('/api/leaderboard/<game_id>')
def api_leaderboard(game_id):
    if game_id not in LEADERBOARD:
        return jsonify({'error': 'Game not found'}), 404
    # Sort by score descending
    sorted_scores = sorted(LEADERBOARD[game_id], key=lambda x: x['score'], reverse=True)[:20]
    return jsonify(sorted_scores)

@app.route('/api/score', methods=['POST'])
def submit_score():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    game_id = data.get('game')
    name = data.get('name', 'Anonymous')[:20]
    score = data.get('score')

    if game_id not in LEADERBOARD:
        return jsonify({'error': 'Invalid game'}), 400
    if not isinstance(score, (int, float)) or score < 0:
        return jsonify({'error': 'Invalid score'}), 400

    entry = {
        'id': generate_id(),
        'name': name.strip() or 'Anonymous',
        'score': int(score),
        'timestamp': datetime.utcnow().isoformat() + 'Z'
    }
    LEADERBOARD[game_id].append(entry)

    # Keep only top 100
    LEADERBOARD[game_id] = sorted(LEADERBOARD[game_id], key=lambda x: x['score'], reverse=True)[:100]

    return jsonify({'success': True, 'entry': entry})

@app.route('/api/health')
def health():
    return jsonify({
        'status': 'ok',
        'timestamp': datetime.utcnow().isoformat() + 'Z',
        'games': len(GAMES_INFO),
        'total_scores': sum(len(v) for v in LEADERBOARD.values())
    })

# Seed some sample leaderboard data
def seed_data():
    sample_names = ['Medha', 'Alex', 'Sam', 'Jordan', 'Casey', 'Riley', 'Taylor', 'Morgan', 'Avery', 'Quinn']
    for game in LEADERBOARD:
        for i in range(8):
            LEADERBOARD[game].append({
                'id': generate_id(),
                'name': random.choice(sample_names),
                'score': random.randint(50, 5000) if game != 'tictactoe' else random.randint(1, 10),
                'timestamp': datetime.utcnow().isoformat() + 'Z'
            })
        LEADERBOARD[game] = sorted(LEADERBOARD[game], key=lambda x: x['score'], reverse=True)

seed_data()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
