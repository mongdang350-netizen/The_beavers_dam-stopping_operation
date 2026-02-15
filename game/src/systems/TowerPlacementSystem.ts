import type { GameState } from '@/core/GameState';
import type { GoldManager } from '@/core/GoldManager';
import type { EventBus } from '@/core/EventBus';
import { towersData } from '@/data/validatedData';
import type { TowerFactory } from '@/entities/TowerFactory';
import type { PathSystem } from '@/systems/PathSystem';
import type { GameEvents, TowerType } from '@/types';

const baseTowerCosts = new Map(
  towersData
    .filter((tower) => ['archer', 'warrior', 'mage', 'bomb'].includes(tower.id))
    .map((tower) => [tower.id as TowerType, tower.cost]),
);

export class TowerPlacementSystem {
  constructor(
    private readonly gameState: GameState,
    private readonly goldManager: GoldManager,
    private readonly towerFactory: TowerFactory,
    private readonly pathSystem: PathSystem,
    private readonly eventBus: EventBus<GameEvents>,
  ) {}

  placeTower(slotIndex: number, towerType: TowerType): boolean {
    if (!this.isSlotEmpty(slotIndex)) {
      return false;
    }

    const cost = baseTowerCosts.get(towerType);
    if (!cost || !this.goldManager.spend(cost)) {
      return false;
    }

    const tower = this.towerFactory.createTower(towerType, slotIndex, this.pathSystem);
    this.gameState.towers.set(slotIndex, tower);
    this.eventBus.emit('towerPlaced', { slotIndex, towerType });
    return true;
  }

  sellTower(slotIndex: number): number {
    const tower = this.gameState.towers.get(slotIndex);
    if (!tower) {
      return 0;
    }

    const refund = this.goldManager.calculateRefund(tower.totalCost);
    this.gameState.towers.delete(slotIndex);
    this.goldManager.earn(refund);
    this.eventBus.emit('towerSold', { slotIndex, goldRefunded: refund });
    return refund;
  }

  isSlotEmpty(slotIndex: number): boolean {
    return !this.gameState.towers.has(slotIndex);
  }

  getAffordableTowers(): TowerType[] {
    const balance = this.goldManager.getBalance();
    const result: TowerType[] = [];
    for (const [type, cost] of baseTowerCosts.entries()) {
      if (balance >= cost) {
        result.push(type);
      }
    }
    return result;
  }
}

