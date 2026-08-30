# GameDev Hub

A complete full-stack game development learning portal with 5 fully playable mini-games, live leaderboard, tutorials, and REST API.

## Features

- **5 Mini-Games**: Snake, Tic Tac Toe (with Minimax AI), Memory Match, Breakout, Pong
- **Full Backend**: Flask + CORS, score submission, leaderboard API
- **Frontend**: Modern dark UI, responsive, all buttons functional
- **Tutorials**: Game loop, Canvas, AI, full-stack scoring
- **Leaderboard**: Submit scores, view top players per game

## Tech Stack

- Backend: Python 3 + Flask
- Frontend: HTML5, CSS3, Vanilla JS, Canvas API
- No database required (in-memory for demo)

## How to Run

```bash
cd backend
pip install -r requirements.txt
python app.py
```

Open http://localhost:5000

## Project Structure

```
gamedev-hub/
├── backend/
│   ├── app.py              # Flask application
│   ├── requirements.txt
│   ├── templates/          # Jinja2 HTML templates
│   └── static/
│       ├── css/style.css
│       └── js/             # main.js + 5 game scripts
└── README.md
```

## API Endpoints

- `GET /api/games` - List games
- `GET /api/leaderboard` - All scores
- `GET /api/leaderboard/<game_id>` - Scores for one game
- `POST /api/score` - Submit score `{ "game": "snake", "name": "Player", "score": 100 }`
- `GET /api/health` - Health check

## Games Controls

| Game       | Controls                  |
|------------|---------------------------|
| Snake      | Arrow keys / WASD         |
| Tic Tac Toe| Mouse click               |
| Memory     | Mouse click               |
| Breakout   | Arrow / WASD / Mouse      |
| Pong       | W/S or Arrow Up/Down      |

All Start / Pause / Restart buttons work. After game over you can submit your score.

Built as a learning project – every button and feature is fully functional.
