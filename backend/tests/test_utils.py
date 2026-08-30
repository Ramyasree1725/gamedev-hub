"""
Tests for utility helpers.
"""
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from utils.helpers_01 import clamp, lerp, distance_2d, validate_name, validate_score, generate_id

def test_clamp():
    assert clamp(5, 0, 10) == 5
    assert clamp(-1, 0, 10) == 0
    assert clamp(15, 0, 10) == 10

def test_lerp():
    assert abs(lerp(0, 10, 0.5) - 5) < 1e-9

def test_distance():
    assert abs(distance_2d(0, 0, 3, 4) - 5) < 1e-9

def test_validate_name():
    assert validate_name("") == "Anonymous"
    assert validate_name("  Alice  ") == "Alice"
    assert len(validate_name("A" * 50)) <= 20

def test_validate_score():
    assert validate_score(100) == 100
    assert validate_score(-5) is None
    assert validate_score("abc") is None

def test_generate_id():
    ids = {generate_id() for _ in range(20)}
    assert len(ids) == 20
