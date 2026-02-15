import type { EventBus } from '@/core/EventBus';
import type { GameState } from '@/core/GameState';
import type { GoldManager } from '@/core/GoldManager';
import type { TowerFactory } from '@/entities/TowerFactory';
import type { GameEvents, TowerType, UpgradeType } from '@/types';

export class UpgradeSystem {
  constructor(
    private readonly gameState: GameState,
    private readonly goldManager: GoldManager,
    private readonly towerFactory: TowerFactory,
    private readonly eventBus: EventBus<GameEvents>,
  ) {}

  getAvailableUpgrades(slotIndex: number): UpgradeType[] {
    const tower = this.gameState.towers.get(slotIndex);
    if (!tower) {
      return [];
    }
    if (this.isUpgraded(slotIndex)) {
      return [];
    }

    return this.towerFactory.getAvailableUpgrades(tower.config.id as TowerType);
  }

  upgradeTower(slotIndex: number, upgradeType: UpgradeType): boolean {
    const tower = this.gameState.towers.get(slotIndex);
    if (!tower || this.isUpgraded(slotIndex)) {
      return false;
    }

    const upgradable = this.getAvailableUpgrades(slotIndex);
    if (!upgradable.includes(upgradeType)) {
      return false;
    }

    const cost = this.towerFactory.getTowerCost(upgradeType);

    if (!this.goldManager.spend(cost)) {
      return false;
    }

    this.towerFactory.upgradeTower(tower, upgradeType);
    this.eventBus.emit('towerUpgraded', { slotIndex, upgradeType });
    return true;
  }

  isUpgraded(slotIndex: number): boolean {
    const tower = this.gameState.towers.get(slotIndex);
    if (!tower) {
      return false;
    }
    return tower.level !== 'base';
  }
}
