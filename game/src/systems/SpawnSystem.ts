import type { EnemyFactory } from '@/entities/EnemyFactory';
import type { Enemy } from '@/entities/Enemy';
import type { PathSystem } from '@/systems/PathSystem';
import type { EnemyType, WaveConfig, EnemyConfig } from '@/types';
import type { ObjectPool } from '@/utils/ObjectPool';
import { enemiesData } from '@/data/validatedData';

interface SpawnItem {
  type: EnemyType;
  delay: number;
}

export class SpawnSystem {
  private plan: SpawnItem[] = [];
  private cursor = 0;
  private delayRemaining = 0;
  private spawned: Enemy[] = [];
  private readonly enemyConfigs: Map<EnemyType, EnemyConfig>;
  private readonly weakEnemies: EnemyType[];
  private readonly midEnemies: EnemyType[];
  private readonly strongEnemies: EnemyType[];
  private readonly bossEnemies: EnemyType[];

  constructor(
    private readonly enemyFactory: EnemyFactory,
    private readonly pathSystem: PathSystem,
    private readonly objectPool: ObjectPool<Enemy>,
  ) {
    this.enemyConfigs = new Map(enemiesData.map((config) => [config.id, config]));
    this.weakEnemies = enemiesData.filter((e) => e.category === 'weak').map((e) => e.id);
    this.midEnemies = enemiesData.filter((e) => e.category === 'mid').map((e) => e.id);
    this.strongEnemies = enemiesData.filter((e) => e.category === 'strong').map((e) => e.id);
    this.bossEnemies = enemiesData.filter((e) => e.category === 'boss').map((e) => e.id);
  }

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
      ...this.weakEnemies,
      ...this.midEnemies,
      ...this.strongEnemies,
      ...this.bossEnemies,
    ].filter((type) => waveConfig.enemies.some((entry) => entry.type === type));

    const plan: SpawnItem[] = [];
    for (const type of orderedTypes) {
      const count = waveConfig.enemies
        .filter((entry) => entry.type === type)
        .reduce((sum, entry) => sum + entry.count, 0);
      const config = this.enemyConfigs.get(type);
      if (!config) {
        continue;
      }
      for (let i = 0; i < count; i += 1) {
        plan.push({
          type,
          delay: i === 0 && this.bossEnemies.includes(type) ? 3 : config.spawnInterval,
        });
      }
    }
    if (plan.length > 0) {
      plan[0].delay = 0;
    }
    return plan;
  }
}

