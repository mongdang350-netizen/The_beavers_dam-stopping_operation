import { INITIAL_DAM_HP } from '@/utils/constants';

export class Dam {
  readonly maxHp: number;
  hp: number;

  constructor(maxHp = INITIAL_DAM_HP) {
    this.maxHp = maxHp;
    this.hp = maxHp;
  }

  takeDamage(amount: number): void {
    this.hp = Math.max(0, this.hp - Math.max(0, amount));
  }

  isDestroyed(): boolean {
    return this.hp <= 0;
  }

  getHpPercent(): number {
    return this.maxHp <= 0 ? 0 : this.hp / this.maxHp;
  }

  reset(): void {
    this.hp = this.maxHp;
  }
}

