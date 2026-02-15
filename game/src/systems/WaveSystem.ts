import type { EventBus } from '@/core/EventBus';
import type { GameState } from '@/core/GameState';
import type { Enemy } from '@/entities/Enemy';
import type { SpawnSystem } from '@/systems/SpawnSystem';
import type { GameEvents, WaveConfig } from '@/types';

export type WaveState = 'preparing' | 'spawning' | 'inProgress' | 'cleared';

export class WaveSystem {
  state: WaveState = 'preparing';

  constructor(
    private readonly gameState: GameState,
    private readonly spawnSystem: SpawnSystem,
    private readonly eventBus: EventBus<GameEvents>,
  ) {}

  startNextWave(stageId: number, waveIndex: number, waveConfig: WaveConfig): boolean {
    if (this.state !== 'preparing' && this.state !== 'cleared') {
      return false;
    }

    this.state = 'spawning';
    this.gameState.setStatus('playing');
    this.spawnSystem.startWave(waveConfig);
    this.eventBus.emit('waveStart', { stageId, waveIndex });
    return true;
  }

  update(dt: number, stageId: number, waveIndex: number): Enemy[] {
    if (this.state === 'spawning') {
      this.spawnSystem.update(dt);
      const spawned = this.spawnSystem.drainSpawned();
      if (spawned.length > 0) {
        this.gameState.enemies.push(...spawned);
      }
      if (this.spawnSystem.isSpawnComplete()) {
        this.state = 'inProgress';
      }
      return spawned;
    }

    if (
      this.state === 'inProgress' &&
      this.spawnSystem.isSpawnComplete() &&
      this.gameState.enemies.length === 0
    ) {
      this.state = 'cleared';
      this.gameState.setStatus('preparing');
      this.eventBus.emit('waveEnd', { stageId, waveIndex });
    }

    return [];
  }

  check(stageId = this.gameState.currentStage, waveIndex = this.gameState.currentWave): void {
    this.update(0, stageId, waveIndex);
  }

  reset(): void {
    this.state = 'preparing';
  }
}
