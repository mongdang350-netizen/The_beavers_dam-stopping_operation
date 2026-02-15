import { GameSession } from '@/scenes/GameSession';

export class DebugController {
  constructor(private readonly session: GameSession) {}

  addGold(amount = 1000): void {
    this.session.addGold(amount);
  }

  resetDamHp(): void {
    this.session.resetDamHp();
  }

  killAllEnemies(): void {
    this.session.killAllEnemies();
  }

  setSpeed(speed: 1 | 2): void {
    this.session.setSpeed(speed);
  }

  skipWave(): void {
    this.session.clearCurrentWaveForDebug();
  }

  skipStage(): void {
    this.session.skipStageForDebug();
  }
}
