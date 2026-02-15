import { EnemyFactory } from '@/entities/EnemyFactory';
import { PathSystem } from '@/systems/PathSystem';
import { SpawnSystem } from '@/systems/SpawnSystem';
import { ObjectPool } from '@/utils/ObjectPool';
import { Enemy } from '@/entities/Enemy';
import { enemiesData, mapsData } from '@/data/validatedData';

describe('SpawnSystem', () => {
  it('spawns enemies with configured counts and positions', () => {
    const pathSystem = new PathSystem(mapsData.defaultMap);
    const factory = new EnemyFactory();
    const pool = new ObjectPool(() => new Enemy(enemiesData[0]), (enemy) => enemy.reset());
    const spawnSystem = new SpawnSystem(factory, pathSystem, pool);

    spawnSystem.startWave({
      enemies: [
        { type: 'piranha', count: 2 },
        { type: 'turtle', count: 1 },
      ],
    });
    spawnSystem.update(5);
    const spawned = spawnSystem.drainSpawned();

    expect(spawned).toHaveLength(3);
    expect(spawned[0].config.id).toBe('piranha');
    expect(spawned[2].config.id).toBe('turtle');
    expect(spawned[0].position).toEqual(pathSystem.getPositionAtProgress(0));
  });

  it('spawns bosses last with 3s cadence', () => {
    const pathSystem = new PathSystem(mapsData.defaultMap);
    const factory = new EnemyFactory();
    const pool = new ObjectPool(() => new Enemy(enemiesData[0]), (enemy) => enemy.reset());
    const spawnSystem = new SpawnSystem(factory, pathSystem, pool);

    spawnSystem.startWave({
      enemies: [
        { type: 'piranha', count: 1 },
        { type: 'anaconda', count: 1 },
      ],
    });
    spawnSystem.update(0.5);
    const first = spawnSystem.drainSpawned();
    expect(first).toHaveLength(1);
    expect(first[0].config.id).toBe('piranha');

    spawnSystem.update(2.4);
    expect(spawnSystem.drainSpawned()).toHaveLength(0);
    spawnSystem.update(0.6);
    const second = spawnSystem.drainSpawned();
    expect(second).toHaveLength(1);
    expect(second[0].config.id).toBe('anaconda');
  });
});
