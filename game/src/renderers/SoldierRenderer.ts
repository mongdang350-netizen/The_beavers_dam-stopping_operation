import Phaser from 'phaser';
import type { SoldierSystem } from '@/systems/SoldierSystem';

interface SoldierVisual {
  circle: Phaser.GameObjects.Arc;
}

export class SoldierRenderer {
  private readonly visuals = new Map<string, SoldierVisual>();

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly soldierSystem: SoldierSystem,
  ) {}

  sync(): void {
    const nextKeys = new Set<string>();

    for (const slotIndex of this.soldierSystem.getManagedSlotIndices()) {
      const squad = this.soldierSystem.getSquad(slotIndex);
      squad?.getSoldiers().forEach((soldier, index) => {
        const key = `${slotIndex}:${index}`;
        nextKeys.add(key);
        const visual = this.visuals.get(key) ?? this.create(key);
        visual.circle.setPosition(soldier.position.x, soldier.position.y);
        visual.circle.setFillStyle(soldier.status === 'dead' ? 0x4f4f4f : 0xfff176);
      });
    }

    [...this.visuals.keys()]
      .filter((key) => !nextKeys.has(key))
      .forEach((key) => {
        this.visuals.get(key)?.circle.destroy();
        this.visuals.delete(key);
      });
  }

  destroy(): void {
    this.visuals.forEach((visual) => visual.circle.destroy());
    this.visuals.clear();
  }

  private create(key: string): SoldierVisual {
    const circle = this.scene.add.circle(0, 0, 6, 0xfff176).setStrokeStyle(1, 0x4e342e);
    const visual = { circle };
    this.visuals.set(key, visual);
    return visual;
  }
}
