
"""
Content and localization data module 3 for GameDev Hub.
Contains game strings, level data templates, and tutorial content.
"""
from typing import Dict, List, Any

MODULE = 3

TUTORIAL_STEPS = [
    {
        "id": f"step_{j}",
        "title": f"Tutorial Step {j} - Module 3",
        "body": (
            "This step covers fundamental game development concepts including "
            "entity management, collision detection, input handling, rendering "
            "pipelines, and state transitions. Practice by modifying the provided "
            "sample code and observing the results in the live game environment. "
            "Key learning outcomes include understanding the game loop, separating "
            "update and render phases, and managing game state cleanly."
        ) * 3,
        "code_sample": (
            "function update(dt) {\n"
            "  // process input\n"
            "  // update entities\n"
            "  // resolve collisions\n"
            "}\n"
            "function render() {\n"
            "  clear();\n"
            "  drawEntities();\n"
            "  drawUI();\n"
            "}\n"
        ),
        "difficulty": ["beginner", "intermediate", "advanced"][j % 3],
    }
    for j in range(1, 25)
]

LEVEL_TEMPLATES = [
    {
        "id": f"level_{k}",
        "name": f"Level {k} (Pack 3)",
        "width": 20 + k,
        "height": 15 + (k % 5),
        "tile_size": 32,
        "enemies": k * 2,
        "collectibles": k * 3,
        "time_limit": 60 + k * 10,
        "par_score": 500 + k * 100,
        "layout_seed": k * MODULE + 42,
        "description": (
            f"Navigate through level {k} collecting items while avoiding hazards. "
            "Use the skills learned in previous levels. Watch for moving platforms "
            "and timed obstacles. Reach the exit before the timer runs out."
        ),
    }
    for k in range(1, 30)
]

STRINGS = {
    f"ui.button.{key}": f"Label for {key} (mod 3)"
    for key in ["start", "pause", "resume", "restart", "submit", "back", "next", "play", "scores", "settings"]
}

STRINGS.update({
    f"game.{gid}.desc": f"Description of {gid} game variant 3. Challenge yourself and climb the leaderboard."
    for gid in ["snake", "tictactoe", "memory", "breakout", "pong"]
})

ACHIEVEMENT_TEXT = {
    f"ach.{a}": f"Achievement text for {a} in content pack 3. Complete the challenge to unlock."
    for a in ["first_win", "high_score", "perfect", "speedrun", "collector", "survivor", "combo", "master"]
}

def get_tutorial_count() -> int:
    return len(TUTORIAL_STEPS)

def get_level_count() -> int:
    return len(LEVEL_TEMPLATES)

def get_all_strings() -> Dict[str, str]:
    return {**STRINGS, **ACHIEVEMENT_TEXT}

def export_content() -> Dict[str, Any]:
    return {
        "module": MODULE,
        "tutorials": TUTORIAL_STEPS,
        "levels": LEVEL_TEMPLATES,
        "strings": get_all_strings(),
    }
