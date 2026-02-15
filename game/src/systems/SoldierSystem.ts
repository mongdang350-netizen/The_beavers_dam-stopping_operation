import type { GameState } from '@/core/GameState';
import { SoldierSquad } from '@/entities/Soldier';
import type { Tower } from '@/entities/Tower';
import type { Position, SoldierConfig } from '@/types';

const BASE_SOLDIER_CONFIG: SoldierConfig = {
  count: 3,
  hp: 80,
  atk: 5,
  attackSpeed: 1,
  def: 10,
  mdef: 0,
  respawnTime: 30,
};

const KNIGHT_SOLDIER_CONFIG: SoldierConfig = {
  count: 3,
  hp: 100,
  atk: 9,
  attackSpeed: 1,
  def: 15,
  mdef: 0,
  respawnTime: 30,
};

const SUIT_SOLDIER_CONFIG: SoldierConfig = {
  count: 1,
  hp: 150,
  atk: 7,
  attackSpeed: 1,
  def: 40,
  mdef: 20,
  respawnTime: 30,
};

type SoldierSignature = 'warrior' | 'knight' | 'suit';

interface ManagedSquad {
  squad: SoldierSquad;
  signature: SoldierSignature;
}

export class SoldierSystem {
  private readonly squads = new Map<number, ManagedSquad>();

  constructor(private readonly gameState: GameState) {}

  update(dt: number): void {
    this.syncSquadsWithTowers();
    const enemies = this.gameState.enemies.filter((enemy) => enemy.status !== 'dead');
    this.squads.forEach((managed) => {
      managed.squad.update(dt, enemies);
    });
  }

  getSquad(slotIndex: number): SoldierSquad | undefined {
    return this.squads.get(slotIndex)?.squad;
  }

  getManagedSlotIndices(): number[] {
    return [...this.squads.keys()];
  }

  private syncSquadsWithTowers(): void {
    const validSlots = new Set<number>();
    this.gameState.towers.forEach((tower, slotIndex) => {
      const signature = this.getSignature(tower);
      if (!signature) {
        return;
      }
      validSlots.add(slotIndex);

      const existing = this.squads.get(slotIndex);
      if (!existing || existing.signature !== signature) {
        this.squads.set(slotIndex, {
          squad: this.createSquad(signature, tower.position),
          signature,
        });
        return;
      }
      existing.squad.setRallyPoint(tower.position);
    });

    [...this.squads.keys()]
      .filter((slotIndex) => !validSlots.has(slotIndex))
      .forEach((slotIndex) => this.squads.delete(slotIndex));
  }

  private createSquad(signature: SoldierSignature, origin: Position): SoldierSquad {
    if (signature === 'suit') {
      return new SoldierSquad(
        SUIT_SOLDIER_CONFIG,
        signature,
        SUIT_SOLDIER_CONFIG.count,
        origin,
        origin,
        { cooldown: 5, duration: 2, radius: 1.5 },
      );
    }
    if (signature === 'knight') {
      return new SoldierSquad(
        KNIGHT_SOLDIER_CONFIG,
        signature,
        KNIGHT_SOLDIER_CONFIG.count,
        origin,
        origin,
      );
    }
    return new SoldierSquad(BASE_SOLDIER_CONFIG, signature, BASE_SOLDIER_CONFIG.count, origin, origin);
  }

  private getSignature(tower: Tower): SoldierSignature | null {
    if (!tower.config.special?.summonSoldiers) {
      return null;
    }
    if (tower.config.id === 'suit') {
      return 'suit';
    }
    if (tower.config.id === 'knight') {
      return 'knight';
    }
    return 'warrior';
  }
}
