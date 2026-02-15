import { EventBus } from '@/core/EventBus';
import type { GameEvents } from '@/types';

export class GoldManager {
  private balance: number;
  private readonly initialGold: number;

  constructor(
    private readonly eventBus: EventBus<GameEvents>,
    initialGold: number,
  ) {
    this.initialGold = initialGold;
    this.balance = initialGold;
  }

  canAfford(cost: number): boolean {
    return this.balance >= cost;
  }

  spend(cost: number): boolean {
    if (!this.canAfford(cost)) {
      return false;
    }

    this.balance -= cost;
    this.eventBus.emit('goldChanged', { amount: -cost, total: this.balance });
    return true;
  }

  earn(amount: number): void {
    this.balance += amount;
    this.eventBus.emit('goldChanged', { amount, total: this.balance });
  }

  getBalance(): number {
    return this.balance;
  }

  reset(): void {
    const previous = this.balance;
    this.balance = this.initialGold;
    this.eventBus.emit('goldChanged', { amount: this.balance - previous, total: this.balance });
  }

  calculateRefund(totalCost: number): number {
    return Math.floor(totalCost * 0.5);
  }
}
