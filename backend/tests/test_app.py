"""
Basic tests for GameDev Hub Flask application.
"""
import pytest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app import app, LEADERBOARD, GAMES_INFO

@pytest.fixture
def client():
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client

def test_health(client):
    rv = client.get("/api/health")
    assert rv.status_code == 200
    data = rv.get_json()
    assert data["status"] == "ok"
    assert data["games"] == 5

def test_index(client):
    rv = client.get("/")
    assert rv.status_code == 200
    assert b"GameDev Hub" in rv.data

def test_games_page(client):
    rv = client.get("/games")
    assert rv.status_code == 200

def test_api_games(client):
    rv = client.get("/api/games")
    assert rv.status_code == 200
    data = rv.get_json()
    assert len(data) == 5

def test_submit_score(client):
    rv = client.post("/api/score", json={
        "game": "snake",
        "name": "TestPlayer",
        "score": 150
    })
    assert rv.status_code == 200
    data = rv.get_json()
    assert data["success"] is True

def test_submit_invalid_score(client):
    rv = client.post("/api/score", json={
        "game": "snake",
        "name": "Test",
        "score": -10
    })
    assert rv.status_code == 400

def test_leaderboard(client):
    rv = client.get("/api/leaderboard/snake")
    assert rv.status_code == 200
    data = rv.get_json()
    assert isinstance(data, list)

def test_leaderboard_invalid_game(client):
    rv = client.get("/api/leaderboard/nonexistent")
    assert rv.status_code == 404

def test_play_page(client):
    rv = client.get("/game/snake")
    assert rv.status_code == 200

def test_about(client):
    rv = client.get("/about")
    assert rv.status_code == 200
