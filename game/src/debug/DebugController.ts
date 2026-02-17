import { GameSession } from '@/scenes/GameSession';
import { INITIAL_DAM_HP } from '@/utils/constants';

export class DebugController {
  constructor(private readonly session: GameSession) {}

  addGold(amount = 1000): void {
    this.session.goldManager.earn(amount);
  }

  resetDamHp(): void {
    this.session.gameState.damHp = INITIAL_DAM_HP;
  }

  killAllEnemies(): void {
    this.session.gameState.enemies.forEach((enemy) => {
      enemy.takeTrueDamage(enemy.hp);
    });
    this.session.gameState.enemies = [];
  }

  setSpeed(speed: 1 | 2): void {
    this.session.setSpeed(speed);
  }

  skipWave(): void {
    this.killAllEnemies();
    this.session.waveSystem.state = 'cleared';
    this.session.stageSystem.check();
  }

  skipStage(): void {
    const currentStage = this.session.gameState.currentStage;
    for (let i = 0; i < 3 && this.session.gameState.currentStage === currentStage; i += 1) {
      this.skipWave();
    }
  }
}
