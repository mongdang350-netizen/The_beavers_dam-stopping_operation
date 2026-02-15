import type { Position } from '@/types';

export const distance = (a: Position, b: Position): number => {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy);
};

export const lerp = (a: number, b: number, t: number): number => {
  return a + (b - a) * t;
};

export const lerpPosition = (a: Position, b: Position, t: number): Position => {
  return {
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t),
  };
};

export const normalize = (v: Position): Position => {
  const magnitude = Math.hypot(v.x, v.y);
  if (magnitude === 0) {
    return { x: 0, y: 0 };
  }

  return {
    x: v.x / magnitude,
    y: v.y / magnitude,
  };
};

const dot = (a: Position, b: Position): number => a.x * b.x + a.y * b.y;

export const isInCone = (
  origin: Position,
  direction: Position,
  target: Position,
  angle: number,
  range: number,
): boolean => {
  const toTarget = { x: target.x - origin.x, y: target.y - origin.y };
  const toTargetDistance = Math.hypot(toTarget.x, toTarget.y);
  if (toTargetDistance > range || toTargetDistance === 0) {
    return false;
  }

  const directionNorm = normalize(direction);
  const toTargetNorm = normalize(toTarget);
  const cosThreshold = Math.cos((angle * Math.PI) / 360);
  return dot(directionNorm, toTargetNorm) >= cosThreshold;
};

