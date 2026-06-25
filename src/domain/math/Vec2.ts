export interface Vec2 {
  x: number;
  y: number;
}

export const Vec2 = {
  create(x = 0, y = 0): Vec2 {
    return { x, y };
  },

  clone(v: Vec2): Vec2 {
    return { x: v.x, y: v.y };
  },

  add(v1: Vec2, v2: Vec2): Vec2 {
    return { x: v1.x + v2.x, y: v1.y + v2.y };
  },

  subtract(v1: Vec2, v2: Vec2): Vec2 {
    return { x: v1.x - v2.x, y: v1.y - v2.y };
  },

  scale(v: Vec2, scalar: number): Vec2 {
    return { x: v.x * scalar, y: v.y * scalar };
  },

  magnitudeSq(v: Vec2): number {
    return v.x * v.x + v.y * v.y;
  },

  magnitude(v: Vec2): number {
    return Math.sqrt(v.x * v.x + v.y * v.y);
  },

  normalize(v: Vec2): Vec2 {
    const mag = Math.sqrt(v.x * v.x + v.y * v.y);
    if (mag === 0) return { x: 0, y: 0 };
    return { x: v.x / mag, y: v.y / mag };
  },

  distanceSq(v1: Vec2, v2: Vec2): number {
    const dx = v1.x - v2.x;
    const dy = v1.y - v2.y;
    return dx * dx + dy * dy;
  },

  distance(v1: Vec2, v2: Vec2): number {
    return Math.sqrt(this.distanceSq(v1, v2));
  },

  lerp(v1: Vec2, v2: Vec2, t: number): Vec2 {
    return {
      x: v1.x + (v2.x - v1.x) * t,
      y: v1.y + (v2.y - v1.y) * t,
    };
  }
};
