import type { EventBus } from '@/core/EventBus';
import type { GameState } from '@/core/GameState';
import type { Enemy } from '@/entities/Enemy';
import type { SpawnSystem } from '@/systems/SpawnSystem';
import type { GameEvents, WaveConfig } from '@/types';

export type WaveState = 'preparing' | 'spawning' | 'inProgress' | 'cleared' | 'countdown';

export class WaveSystem {
  state: WaveState = 'preparing';
  private countdownTimer = 0;

  constructor(
    private readonly gameState: GameState,
    private readonly spawnSystem: SpawnSystem,
    private readonly eventBus: EventBus<GameEvents>,
  ) {}

  startNextWave(stageId: number, waveIndex: number, waveConfig: WaveConfig): boolean {
    if (this.state !== 'preparing' && this.state !== 'cleared' && this.state !== 'countdown') {
      return false;
    }

    this.state = 'spawning';
    this.countdownTimer = 0;
    this.gameState.setStatus('playing');
    this.spawnSystem.startWave(waveConfig);
    this.eventBus.emit('waveStart', { stageId, waveIndex });
    return true;
  }

  update(dt: number, stageId: number, waveIndex: number): Enemy[] {
    if (this.state === 'countdown') {
      this.countdownTimer -= dt;
      if (this.countdownTimer <= 0) {
        this.countdownTimer = 0;
        // Don't set state to 'spawning' directly - let GameScene call startWave()
      }
      return [];
    }

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
    this.countdownTimer = 0;
  }

  startCountdown(): void {
    if (this.state === 'cleared') {
      this.state = 'countdown';
      this.countdownTimer = 3.0;
    }
  }

  getCountdown(): number {
    return this.countdownTimer;
  }
}
