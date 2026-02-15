import type { EnemyFactory } from '@/entities/EnemyFactory';
import type { Enemy } from '@/entities/Enemy';
import type { PathSystem } from '@/systems/PathSystem';
import type { EnemyType, WaveConfig } from '@/types';
import type { ObjectPool } from '@/utils/ObjectPool';

interface SpawnItem {
  type: EnemyType;
  delay: number;
}

const weakEnemies: EnemyType[] = ['piranha', 'catfish'];
const midEnemies: EnemyType[] = ['iguana', 'waterSnake'];
const strongEnemies: EnemyType[] = ['turtle', 'crocodile', 'hippo'];
const bossEnemies: EnemyType[] = ['anaconda', 'elephant'];

const spawnIntervals: Record<EnemyType, number> = {
  piranha: 0.3,
  catfish: 0.3,
  iguana: 0.5,
  waterSnake: 0.5,
  turtle: 1.5,
  crocodile: 1.5,
  hippo: 1.5,
  anaconda: 3,
  elephant: 3,
};

export class SpawnSystem {
  private plan: SpawnItem[] = [];
  private cursor = 0;
  private delayRemaining = 0;
  private spawned: Enemy[] = [];

  constructor(
    private readonly enemyFactory: EnemyFactory,
    private readonly pathSystem: PathSystem,
    private readonly objectPool: ObjectPool<Enemy>,
  ) {}

  startWave(waveConfig: WaveConfig): void {
    this.plan = this.buildSpawnPlan(waveConfig);
    this.cursor = 0;
    this.delayRemaining = this.plan[0]?.delay ?? 0;
    this.spawned = [];
  }

  update(dt: number): void {
    if (this.isSpawnComplete()) {
      return;
    }

    let remainingDt = dt;
    while (remainingDt >= 0 && this.cursor < this.plan.length) {
      if (remainingDt < this.delayRemaining) {
        this.delayRemaining -= remainingDt;
        break;
      }

      remainingDt -= this.delayRemaining;
      const current = this.plan[this.cursor];
      const enemy = this.enemyFactory.createEnemy(current.type, this.objectPool);
      enemy.progress = 0;
      enemy.position = this.pathSystem.getPositionAtProgress(0);
      enemy.status = 'moving';
      this.spawned.push(enemy);

      this.cursor += 1;
      this.delayRemaining = this.plan[this.cursor]?.delay ?? 0;
      if (this.cursor >= this.plan.length) {
        break;
      }
    }
  }

  drainSpawned(): Enemy[] {
    const snapshot = this.spawned;
    this.spawned = [];
    return snapshot;
  }

  isSpawnComplete(): boolean {
    return this.cursor >= this.plan.length;
  }

  private buildSpawnPlan(waveConfig: WaveConfig): SpawnItem[] {
    const orderedTypes = [
      ...weakEnemies,
      ...midEnemies,
      ...strongEnemies,
      ...bossEnemies,
    ].filter((type) => waveConfig.enemies.some((entry) => entry.type === type));

    const plan: SpawnItem[] = [];
    for (const type of orderedTypes) {
      const count = waveConfig.enemies
        .filter((entry) => entry.type === type)
        .reduce((sum, entry) => sum + entry.count, 0);
      for (let i = 0; i < count; i += 1) {
        plan.push({
          type,
          delay: i === 0 && bossEnemies.includes(type) ? 3 : spawnIntervals[type],
        });
      }
    }
    if (plan.length > 0) {
      plan[0].delay = 0;
    }
    return plan;
  }
}

