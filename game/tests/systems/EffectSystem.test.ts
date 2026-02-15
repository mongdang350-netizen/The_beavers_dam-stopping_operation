import { enemiesData } from '@/data/validatedData';
import { Enemy } from '@/entities/Enemy';
import { EffectSystem } from '@/systems/EffectSystem';
import { PathSystem } from '@/systems/PathSystem';

const pathSystem = new PathSystem({
  waypoints: [
    { x: 0, y: 0 },
    { x: 100, y: 0 },
  ],
  towerSlots: [
    { id: 0, x: 0, y: 10 },
    { id: 1, x: 10, y: 10 },
    { id: 2, x: 20, y: 10 },
    { id: 3, x: 30, y: 10 },
    { id: 4, x: 40, y: 10 },
    { id: 5, x: 50, y: 10 },
  ],
  damPosition: { x: 100, y: 0 },
});

describe('EffectSystem', () => {
  it('applies poison tick damage and removes on expire', () => {
    const enemy = new Enemy(enemiesData[0]);
    enemy.applyEffect({ type: 'poison', duration: 1, value: 3, ignoresArmor: true });
    const effectSystem = new EffectSystem();

    effectSystem.update(1, [enemy]);
    expect(enemy.hp).toBeCloseTo(7, 5);
    expect(enemy.effects).toHaveLength(0);
  });

  it('applies slow to effective movement speed', () => {
    const enemy = new Enemy(enemiesData.find((entry) => entry.id === 'catfish')!);
    enemy.applyEffect({ type: 'slow', duration: 3, value: 0.3, ignoresArmor: false });
    expect(enemy.getEffectiveSpeed()).toBeCloseTo(enemy.config.speed * 0.7, 5);
  });

  it('stun stops movement update while active', () => {
    const enemy = new Enemy(enemiesData[0]);
    enemy.applyEffect({ type: 'stun', duration: 2, value: 0, ignoresArmor: true });
    enemy.update(1, pathSystem);
    expect(enemy.progress).toBe(0);
  });

  it('refreshes duplicate effect timer', () => {
    const enemy = new Enemy(enemiesData[0]);
    enemy.applyEffect({ type: 'slow', duration: 1, value: 0.3, ignoresArmor: false });
    enemy.applyEffect({ type: 'slow', duration: 3, value: 0.3, ignoresArmor: false });
    expect(enemy.effects.find((effect) => effect.type === 'slow')?.duration).toBe(3);
  });
});

