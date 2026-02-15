import { enemiesData, mapsData, stagesData, textsData, towersData } from '@/data/validatedData';
import { GAME_HEIGHT, GAME_WIDTH } from '@/utils/constants';

describe('data schema', () => {
  it('parses all tower records with required fields', () => {
    expect(towersData).toHaveLength(12);
    towersData.forEach((tower) => {
      expect(tower.id).toBeTruthy();
      expect(tower.name).toBeTruthy();
      expect(tower.cost).toBeGreaterThanOrEqual(0);
    });
  });

  it('parses all enemy records with required fields', () => {
    expect(enemiesData).toHaveLength(9);
    enemiesData.forEach((enemy) => {
      expect(enemy.hp).toBeGreaterThan(0);
      expect(enemy.attackSpeed).toBeGreaterThan(0);
    });
  });

  it('keeps all waypoint coordinates in bounds', () => {
    mapsData.defaultMap.waypoints.forEach((point) => {
      expect(point.x).toBeGreaterThanOrEqual(0);
      expect(point.x).toBeLessThanOrEqual(GAME_WIDTH);
      expect(point.y).toBeGreaterThanOrEqual(0);
      expect(point.y).toBeLessThanOrEqual(GAME_HEIGHT);
    });
  });

  it('uses only declared enemy ids in stages', () => {
    const ids = new Set(enemiesData.map((enemy) => enemy.id));

    stagesData.forEach((stage) => {
      stage.waves.forEach((wave) => {
        wave.enemies.forEach((entry) => {
          expect(ids.has(entry.type)).toBe(true);
        });
      });
    });
  });

  it('contains korean text namespace', () => {
    expect(textsData.ko.start).toBe('시작');
  });
});
