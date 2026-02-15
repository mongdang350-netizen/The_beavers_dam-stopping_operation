import { enemiesData } from '@/data/validatedData';
import { Enemy } from '@/entities/Enemy';
import { EnemyFactory } from '@/entities/EnemyFactory';
import { PathSystem } from '@/systems/PathSystem';
import { ObjectPool } from '@/utils/ObjectPool';

const map = {
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
};

describe('Enemy', () => {
  it('creates all 9 enemy types with expected stats', () => {
    const factory = new EnemyFactory();
    for (const config of enemiesData) {
      const enemy = factory.createEnemy(config.id);
      expect(enemy.config.id).toBe(config.id);
      expect(enemy.hp).toBe(config.hp);
      expect(enemy.config.attackSpeed).toBeGreaterThan(0);
    }
  });

  it('moves using speed and transitions to attackingDam', () => {
    const pathSystem = new PathSystem(map);
    const enemy = new Enemy(enemiesData.find((entry) => entry.id === 'waterSnake')!);

    enemy.update(1, pathSystem);
    expect(enemy.progress).toBeGreaterThan(0);
    enemy.update(10, pathSystem);
    expect(enemy.status).toBe('attackingDam');
  });

  it('can be blocked and returns to moving when released', () => {
    const enemy = new Enemy(enemiesData[0]);
    const fakeSoldier = {
      takeDamage: vi.fn(),
      isDead: () => false,
    };

    enemy.blockBy(fakeSoldier);
    expect(enemy.status).toBe('blocked');
    enemy.releaseBlock();
    expect(enemy.status).toBe('moving');
  });

  it('applies defense mitigation and dies with gold result', () => {
    const enemy = new Enemy(enemiesData.find((entry) => entry.id === 'turtle')!);

    const result = enemy.takeDamage(100, 'physical');
    expect(result.damage).toBe(95);
    expect(result.isDead).toBe(true);
    expect(result.goldEarned).toBe(enemy.config.gold);
  });

  it('ticks poison and refreshes poison duration on reapply', () => {
    const enemy = new Enemy(enemiesData[0]);

    enemy.applyEffect({ type: 'poison', duration: 5, value: 3, ignoresArmor: true });
    enemy.tickEffects(1);
    expect(enemy.hp).toBeCloseTo(enemy.maxHp - 3, 5);

    enemy.applyEffect({ type: 'poison', duration: 5, value: 3, ignoresArmor: true });
    const poison = enemy.effects.find((effect) => effect.type === 'poison');
    expect(poison?.duration).toBe(5);
  });

  it('applies slow to movement and attack speed', () => {
    const enemy = new Enemy(enemiesData.find((entry) => entry.id === 'catfish')!);
    enemy.applyEffect({ type: 'slow', duration: 3, value: 0.3, ignoresArmor: false });

    expect(enemy.getEffectiveSpeed()).toBeCloseTo(enemy.config.speed * 0.7, 5);
    expect(enemy.getEffectiveAttackSpeed()).toBeCloseTo(enemy.config.attackSpeed * 0.8, 5);
  });

  it('damages dam while attackingDam', () => {
    const pathSystem = new PathSystem(map);
    const enemy = new Enemy(enemiesData[0]);
    enemy.progress = 1;
    enemy.status = 'attackingDam';
    const onDamDamage = vi.fn();

    enemy.update(1, pathSystem, { onDamDamage });
    expect(onDamDamage).toHaveBeenCalledWith(enemy.config.atk * enemy.config.attackSpeed);
  });

  it('reuses enemy instance from object pool', () => {
    const factory = new EnemyFactory();
    const pool = new ObjectPool(
      () => factory.createEnemy('piranha'),
      (enemy) => enemy.reset(),
    );

    const first = factory.createEnemy('piranha', pool);
    first.takeTrueDamage(999);
    pool.release(first);
    const second = factory.createEnemy('catfish', pool);

    expect(second).toBe(first);
    expect(second.hp).toBe(second.config.hp);
    expect(second.config.id).toBe('catfish');
  });
});

