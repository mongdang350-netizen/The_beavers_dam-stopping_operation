import { enemiesData } from '@/data/validatedData';
import { Enemy } from '@/entities/Enemy';
import { Projectile } from '@/entities/Projectile';
import { ObjectPool } from '@/utils/ObjectPool';

describe('Projectile', () => {
  it('moves toward target and reaches it', () => {
    const enemy = new Enemy(enemiesData[0]);
    enemy.position = { x: 100, y: 0 };
    const projectile = new Projectile({
      origin: { x: 0, y: 0 },
      target: enemy,
      speed: 100,
      damage: 5,
      attackType: 'physical',
    });

    projectile.update(0.5);
    expect(projectile.position.x).toBeCloseTo(50, 5);
    projectile.update(0.5);
    expect(projectile.hasReachedTarget()).toBe(true);
  });

  it('supports pooling acquire and release', () => {
    const pool = new ObjectPool(
      () =>
        new Projectile({
          origin: { x: 0, y: 0 },
          target: null,
          damage: 1,
          attackType: 'physical',
          direction: { x: 1, y: 0 },
        }),
      (projectile) => projectile.reset(),
    );

    const one = pool.acquire();
    one.update(1);
    pool.release(one);
    const two = pool.acquire();
    expect(two).toBe(one);
    expect(two.active).toBe(false);
  });
});

