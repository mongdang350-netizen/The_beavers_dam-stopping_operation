import { mapsData } from '@/data/validatedData';
import { PathSystem } from '@/systems/PathSystem';
import { distance } from '@/utils/math';

describe('PathSystem', () => {
  it('returns path endpoints at progress 0 and 1', () => {
    const path = new PathSystem(mapsData.defaultMap);

    expect(path.getPositionAtProgress(0)).toEqual({ x: 640, y: 0 });
    expect(path.getPositionAtProgress(1)).toEqual({ x: 640, y: 720 });
  });

  it('interpolates correctly between waypoints', () => {
    const map = {
      waypoints: [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
      ],
      towerSlots: [{ id: 0, x: 10, y: 10 }],
      damPosition: { x: 100, y: 0 },
    };
    const path = new PathSystem(map);

    expect(path.getPositionAtProgress(0.5)).toEqual({ x: 50, y: 0 });
    expect(path.getProgressAtPosition({ x: 75, y: 0 })).toBeCloseTo(0.75, 5);
  });

  it('converts speed to progress', () => {
    const path = new PathSystem(mapsData.defaultMap);
    const speedAsProgress = path.getSpeedAsProgress(5);
    const expected = (5 * 64) / path.getTotalPathLength();
    expect(speedAsProgress).toBeCloseTo(expected, 8);
  });

  it('checks range boundaries', () => {
    const path = new PathSystem(mapsData.defaultMap);
    expect(path.isInRange({ x: 0, y: 0 }, { x: 64, y: 0 }, 1)).toBe(true);
    expect(path.isInRange({ x: 0, y: 0 }, { x: 65, y: 0 }, 1)).toBe(false);
  });

  it('keeps all tower slots off the river path centerline', () => {
    const path = new PathSystem(mapsData.defaultMap);
    const slots = path.getTowerSlots();

    for (const slot of slots) {
      const progress = path.getProgressAtPosition(slot);
      const nearestPathPoint = path.getPositionAtProgress(progress);
      expect(distance(slot, nearestPathPoint)).toBeGreaterThan(3);
    }
  });
});
