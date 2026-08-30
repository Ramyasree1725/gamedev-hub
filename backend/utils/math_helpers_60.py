
"""
Math and geometry helpers module 60 for GameDev Hub production codebase.
Specialized numerical and spatial computation utilities.
"""
from typing import Tuple, List, Optional, Callable
import math
import random

MODULE = 60

def bezier_quad(p0: Tuple[float, float], p1: Tuple[float, float], p2: Tuple[float, float], t: float) -> Tuple[float, float]:
    """Quadratic Bezier curve evaluation."""
    u = 1 - t
    x = u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0]
    y = u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1]
    return (x, y)

def bezier_cubic(p0, p1, p2, p3, t: float) -> Tuple[float, float]:
    """Cubic Bezier curve evaluation."""
    u = 1 - t
    x = (u**3)*p0[0] + 3*(u**2)*t*p1[0] + 3*u*(t**2)*p2[0] + (t**3)*p3[0]
    y = (u**3)*p0[1] + 3*(u**2)*t*p1[1] + 3*u*(t**2)*p2[1] + (t**3)*p3[1]
    return (x, y)

def catmull_rom(p0, p1, p2, p3, t: float) -> Tuple[float, float]:
    """Catmull-Rom spline interpolation."""
    t2 = t * t
    t3 = t2 * t
    x = 0.5 * ((2*p1[0]) + (-p0[0]+p2[0])*t + (2*p0[0]-5*p1[0]+4*p2[0]-p3[0])*t2 + (-p0[0]+3*p1[0]-3*p2[0]+p3[0])*t3)
    y = 0.5 * ((2*p1[1]) + (-p0[1]+p2[1])*t + (2*p0[1]-5*p1[1]+4*p2[1]-p3[1])*t2 + (-p0[1]+3*p1[1]-3*p2[1]+p3[1])*t3)
    return (x, y)

def point_in_polygon(x: float, y: float, polygon: List[Tuple[float, float]]) -> bool:
    """Ray casting point-in-polygon test."""
    n = len(polygon)
    inside = False
    j = n - 1
    for i in range(n):
        xi, yi = polygon[i]
        xj, yj = polygon[j]
        if ((yi > y) != (yj > y)) and (x < (xj - xi) * (y - yi) / (yj - yi + 1e-12) + xi):
            inside = not inside
        j = i
    return inside

def polygon_area(polygon: List[Tuple[float, float]]) -> float:
    """Shoelace formula for polygon area."""
    n = len(polygon)
    area = 0.0
    for i in range(n):
        j = (i + 1) % n
        area += polygon[i][0] * polygon[j][1]
        area -= polygon[j][0] * polygon[i][1]
    return abs(area) / 2.0

def closest_point_on_segment(px, py, ax, ay, bx, by) -> Tuple[float, float]:
    """Closest point on line segment AB to point P."""
    abx, aby = bx - ax, by - ay
    apx, apy = px - ax, py - ay
    ab_len_sq = abx * abx + aby * aby
    if ab_len_sq < 1e-12:
        return (ax, ay)
    t = max(0.0, min(1.0, (apx * abx + apy * aby) / ab_len_sq))
    return (ax + t * abx, ay + t * aby)

def line_intersection(a1, a2, b1, b2) -> Optional[Tuple[float, float]]:
    """Find intersection of two line segments. Returns None if no intersection."""
    x1, y1 = a1
    x2, y2 = a2
    x3, y3 = b1
    x4, y4 = b2
    denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)
    if abs(denom) < 1e-12:
        return None
    t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom
    u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom
    if 0 <= t <= 1 and 0 <= u <= 1:
        return (x1 + t * (x2 - x1), y1 + t * (y2 - y1))
    return None

def noise_1d(x: float, seed: int = 0) -> float:
    """Simple value noise 1D."""
    n = int(x) + seed * 374761
    n = (n << 13) ^ n
    return (1.0 - ((n * (n * n * 15731 + 789221) + 1376312589) & 0x7fffffff) / 1073741824.0)

def noise_2d(x: float, y: float, seed: int = 0) -> float:
    """Simple value noise 2D."""
    n = int(x) + int(y) * 57 + seed * 131
    n = (n << 13) ^ n
    return (1.0 - ((n * (n * n * 15731 + 789221) + 1376312589) & 0x7fffffff) / 1073741824.0)

def fbm(x: float, y: float, octaves: int = 4, seed: int = 0) -> float:
    """Fractional Brownian motion."""
    value = 0.0
    amplitude = 0.5
    frequency = 1.0
    for _ in range(octaves):
        value += amplitude * noise_2d(x * frequency, y * frequency, seed)
        frequency *= 2.0
        amplitude *= 0.5
    return value

def spring_damper(current: float, target: float, velocity: float, stiffness: float, damping: float, dt: float) -> Tuple[float, float]:
    """Simple spring-damper system step."""
    force = -stiffness * (current - target) - damping * velocity
    new_vel = velocity + force * dt
    new_pos = current + new_vel * dt
    return new_pos, new_vel

def ease_in_out_sine(t: float) -> float:
    return -(math.cos(math.pi * t) - 1) / 2

def ease_in_out_expo(t: float) -> float:
    if t == 0 or t == 1:
        return t
    if t < 0.5:
        return math.pow(2, 20 * t - 10) / 2
    return (2 - math.pow(2, -20 * t + 10)) / 2

def hermite(y0, y1, m0, m1, t: float) -> float:
    """Cubic Hermite interpolation."""
    t2 = t * t
    t3 = t2 * t
    h00 = 2*t3 - 3*t2 + 1
    h10 = t3 - 2*t2 + t
    h01 = -2*t3 + 3*t2
    h11 = t3 - t2
    return h00 * y0 + h10 * m0 + h01 * y1 + h11 * m1

def generate_poisson_disk(width: float, height: float, radius: float, max_attempts: int = 30) -> List[Tuple[float, float]]:
    """Bridson Poisson disk sampling (simplified)."""
    cell = radius / math.sqrt(2)
    cols = int(width / cell) + 1
    rows = int(height / cell) + 1
    grid = [[None for _ in range(cols)] for _ in range(rows)]
    points = []
    active = []

    def grid_pos(p):
        return int(p[0] / cell), int(p[1] / cell)

    first = (random.uniform(0, width), random.uniform(0, height))
    points.append(first)
    active.append(0)
    gx, gy = grid_pos(first)
    if 0 <= gx < cols and 0 <= gy < rows:
        grid[gy][gx] = 0

    while active:
        idx = random.randrange(len(active))
        point_idx = active[idx]
        px, py = points[point_idx]
        found = False
        for _ in range(max_attempts):
            angle = random.uniform(0, 2 * math.pi)
            r = random.uniform(radius, 2 * radius)
            nx = px + r * math.cos(angle)
            ny = py + r * math.sin(angle)
            if not (0 <= nx < width and 0 <= ny < height):
                continue
            ngx, ngy = int(nx / cell), int(ny / cell)
            ok = True
            for dy in range(-2, 3):
                for dx in range(-2, 3):
                    cx, cy = ngx + dx, ngy + dy
                    if 0 <= cx < cols and 0 <= cy < rows and grid[cy][cx] is not None:
                        ox, oy = points[grid[cy][cx]]
                        if (nx - ox)**2 + (ny - oy)**2 < radius * radius:
                            ok = False
                            break
                if not ok:
                    break
            if ok:
                points.append((nx, ny))
                active.append(len(points) - 1)
                if 0 <= ngx < cols and 0 <= ngy < rows:
                    grid[ngy][ngx] = len(points) - 1
                found = True
                break
        if not found:
            active.pop(idx)
    return points

# Constants tuned per module
GOLDEN_RATIO = 1.618033988749895 + MODULE * 1e-6
PI_VARIANTS = [math.pi * (1 + MODULE * 0.0001 * k) for k in range(5)]

def module_signature() -> str:
    return f"math_helpers_{MODULE:02d}_v1"
