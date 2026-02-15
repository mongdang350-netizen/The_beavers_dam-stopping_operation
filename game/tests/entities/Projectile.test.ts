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

  it('stores sourceType when provided', () => {
    const projectile = new Projectile({
      origin: { x: 0, y: 0 },
      target: null,
      damage: 10,
      attackType: 'physical',
      sourceType: 'archer',
    });
    expect(projectile.sourceType).toBe('archer');
  });

  it('defaults sourceType to empty string when not provided', () => {
    const projectile = new Projectile({
      origin: { x: 0, y: 0 },
      target: null,
      damage: 10,
      attackType: 'physical',
    });
    expect(projectile.sourceType).toBe('');
  });

  it('reset without init clears sourceType indirectly by deactivating', () => {
    const projectile = new Projectile({
      origin: { x: 0, y: 0 },
      target: null,
      damage: 10,
      attackType: 'physical',
      sourceType: 'mage',
    });
    projectile.reset();
    expect(projectile.active).toBe(false);
    expect(projectile.target).toBeNull();
  });

  it('reset with new init resets sourceType to new value', () => {
    const projectile = new Projectile({
      origin: { x: 0, y: 0 },
      target: null,
      damage: 10,
      attackType: 'physical',
      sourceType: 'mage',
    });
    projectile.reset({
      origin: { x: 5, y: 5 },
      target: null,
      damage: 20,
      attackType: 'magical',
      sourceType: 'bomb',
    });
    expect(projectile.sourceType).toBe('bomb');
  });

  it('reset with new init defaults sourceType to empty string when omitted', () => {
    const projectile = new Projectile({
      origin: { x: 0, y: 0 },
      target: null,
      damage: 10,
      attackType: 'physical',
      sourceType: 'archer',
    });
    projectile.reset({
      origin: { x: 5, y: 5 },
      target: null,
      damage: 20,
      attackType: 'physical',
    });
    expect(projectile.sourceType).toBe('');
  });
});
