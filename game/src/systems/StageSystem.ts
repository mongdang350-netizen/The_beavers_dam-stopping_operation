import type { EventBus } from '@/core/EventBus';
import type { GameState } from '@/core/GameState';
import type { GoldManager } from '@/core/GoldManager';
import type { ScoreCalculator } from '@/core/ScoreCalculator';
import type { WaveSystem } from '@/systems/WaveSystem';
import type { EnemyConfig, GameEvents, StageConfig } from '@/types';
import { DEFAULT_PAR_TIME_SECONDS, INITIAL_DAM_HP } from '@/utils/constants';

export class StageSystem {
  private stageIndex = 0;
  private waveIndex = 0;
  private started = false;

  constructor(
    private readonly gameState: GameState,
    private readonly waveSystem: WaveSystem,
    private readonly stages: StageConfig[],
    private readonly scoreCalculator: ScoreCalculator,
    private readonly enemies: EnemyConfig[],
    private readonly goldManager: GoldManager,
    private readonly eventBus: EventBus<GameEvents>,
  ) {}

  getCurrentStage(): StageConfig {
    return this.stages[this.stageIndex];
  }

  getCurrentWaveIndex(): number {
    return this.waveIndex;
  }

  start(): void {
    if (this.started) {
      return;
    }
    this.started = true;
    this.enterStage(0);
  }

  startCurrentWave(): boolean {
    const stage = this.getCurrentStage();
    const wave = stage.waves[this.waveIndex];
    return this.waveSystem.startNextWave(stage.id, this.waveIndex + 1, wave);
  }

  check(): void {
    if (!this.started) {
      return;
    }
    if (this.gameState.gameStatus === 'gameOver') {
      return;
    }

    if (this.waveSystem.state !== 'cleared') {
      return;
    }

    if (this.waveIndex < 2) {
      this.waveIndex += 1;
      this.gameState.currentWave = this.waveIndex + 1;
      this.waveSystem.reset();
      return;
    }

    this.eventBus.emit('stageEnd', { stageId: this.getCurrentStage().id });
    if (this.stageIndex < this.stages.length - 1) {
      this.enterStage(this.stageIndex + 1);
      return;
    }

    const maxGold = this.scoreCalculator.calculateMaxGold(this.stages, this.enemies);
    const score = this.scoreCalculator.calculateScore(
      this.gameState.damHp,
      INITIAL_DAM_HP,
      this.goldManager.getBalance(),
      maxGold,
      this.gameState.elapsedTime,
      DEFAULT_PAR_TIME_SECONDS,
    );
    const stars = this.scoreCalculator.getStars(score);
    this.gameState.setStatus('victory');
    this.eventBus.emit('victory', { score, stars });
  }

  private enterStage(index: number): void {
    this.stageIndex = index;
    this.waveIndex = 0;
    this.waveSystem.reset();
    this.gameState.currentStage = this.stages[index].id;
    this.gameState.currentWave = 1;
    this.gameState.setStatus('preparing');
    if (this.stages[index].bonusGold) {
      this.goldManager.earn(this.stages[index].bonusGold ?? 0);
    }
    this.eventBus.emit('stageStart', { stageId: this.stages[index].id });
  }
}
