import { GoldManager } from '@/core/GoldManager';
import { EventBus } from '@/core/EventBus';
import type { Enemy } from '@/entities/Enemy';
import type { Projectile } from '@/entities/Projectile';
import type { Tower } from '@/entities/Tower';
import type { GameEvents } from '@/types';
import { INITIAL_DAM_HP } from '@/utils/constants';

export type GameStatus = 'menu' | 'preparing' | 'playing' | 'paused' | 'gameOver' | 'victory';

export class GameState {
  gold: number;
  damHp: number;
  damMaxHp: number;
  currentStage: number;
  currentWave: number;
  gameStatus: GameStatus;
  speed: 1 | 2;
  towers: Map<number, Tower>;
  enemies: Enemy[];
  projectiles: Projectile[];
  elapsedTime: number;
  totalGoldEarned: number;

  constructor(
    private readonly eventBus: EventBus<GameEvents>,
    private readonly goldManager: GoldManager,
  ) {
    this.gold = goldManager.getBalance();
    this.damHp = INITIAL_DAM_HP;
    this.damMaxHp = INITIAL_DAM_HP;
    this.currentStage = 1;
    this.currentWave = 1;
    this.gameStatus = 'menu';
    this.speed = 1;
    this.towers = new Map();
    this.enemies = [];
    this.projectiles = [];
    this.elapsedTime = 0;
    this.totalGoldEarned = 0;

    this.eventBus.on('goldChanged', ({ total, amount }) => {
      this.gold = total;
      if (amount > 0) {
        this.totalGoldEarned += amount;
      }
    });
  }

  setStatus(status: GameStatus): void {
    this.gameStatus = status;
  }

  setSpeed(speed: 1 | 2): void {
    this.speed = speed;
  }

  damageDam(amount: number): void {
    this.damHp = Math.max(0, this.damHp - amount);
    this.eventBus.emit('damDamaged', {
      damage: amount,
      remainingHp: this.damHp,
    });

    if (this.damHp <= 0) {
      this.gameStatus = 'gameOver';
      this.eventBus.emit('gameOver', {});
    }
  }

  advanceWave(): void {
    this.currentWave += 1;
  }

  advanceStage(): void {
    this.currentStage += 1;
    this.currentWave = 1;
  }

  reset(): void {
    this.goldManager.reset();
    this.gold = this.goldManager.getBalance();
    this.damHp = INITIAL_DAM_HP;
    this.damMaxHp = INITIAL_DAM_HP;
    this.currentStage = 1;
    this.currentWave = 1;
    this.gameStatus = 'menu';
    this.speed = 1;
    this.towers.clear();
    this.enemies = [];
    this.projectiles = [];
    this.elapsedTime = 0;
    this.totalGoldEarned = 0;
  }

  syncGoldFromManager(): void {
    this.gold = this.goldManager.getBalance();
  }
}
