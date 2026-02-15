import { enemiesData } from '@/data/validatedData';
import { Enemy } from '@/entities/Enemy';
import type { EnemyType } from '@/types';
import type { ObjectPool } from '@/utils/ObjectPool';

const enemyConfigById = new Map(enemiesData.map((config) => [config.id, config]));

export class EnemyFactory {
  createEnemy(type: EnemyType, pool?: ObjectPool<Enemy>): Enemy {
    const config = enemyConfigById.get(type);
    if (!config) {
      throw new Error(`Unknown enemy type: ${type}`);
    }

    if (pool) {
      const enemy = pool.acquire();
      enemy.initialize(config);
      return enemy;
    }

    return new Enemy(config);
  }
}

