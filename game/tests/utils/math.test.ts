import { distance, isInCone, lerp, lerpPosition, normalize } from '@/utils/math';

describe('math utils', () => {
  it('computes distance', () => {
    expect(distance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
  });

  it('performs linear interpolation', () => {
    expect(lerp(10, 20, 0.25)).toBe(12.5);
    expect(lerpPosition({ x: 0, y: 0 }, { x: 10, y: 20 }, 0.5)).toEqual({ x: 5, y: 10 });
  });

  it('normalizes vectors', () => {
    expect(normalize({ x: 3, y: 4 })).toEqual({ x: 0.6, y: 0.8 });
    expect(normalize({ x: 0, y: 0 })).toEqual({ x: 0, y: 0 });
  });

  it('checks cone inclusion', () => {
    const origin = { x: 0, y: 0 };
    const direction = { x: 1, y: 0 };
    expect(isInCone(origin, direction, { x: 10, y: 0 }, 60, 20)).toBe(true);
    expect(isInCone(origin, direction, { x: 0, y: 10 }, 60, 20)).toBe(false);
    expect(isInCone(origin, direction, { x: 30, y: 0 }, 60, 20)).toBe(false);
  });
});

