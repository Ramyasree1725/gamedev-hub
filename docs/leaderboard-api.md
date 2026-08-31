# Leaderboard API quick reference

Use `GET /api/leaderboard` to retrieve scores for all games, or `GET /api/leaderboard/<game_id>` to retrieve one game's scores.

Submit a score with `POST /api/score` and a JSON body containing `game`, `name`, and `score`. Validate that the game identifier and score match the expected game before sending the request.
