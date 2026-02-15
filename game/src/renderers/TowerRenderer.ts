import Phaser from 'phaser';
import type { Tower } from '@/entities/Tower';
import type { TowerSlot } from '@/types';
import { getTowerColor, visualPolicy } from '@/renderers/visualPolicy';

interface SlotVisual {
  box: Phaser.GameObjects.Rectangle;
  plusLabel: Phaser.GameObjects.Text;
}

interface TowerVisual {
  body: Phaser.GameObjects.Rectangle;
  label: Phaser.GameObjects.Text;
}

export class TowerRenderer {
  private readonly slotVisuals = new Map<number, SlotVisual>();
  private readonly towerVisuals = new Map<number, TowerVisual>();

  constructor(private readonly scene: Phaser.Scene) {}

  renderSlots(slots: TowerSlot[], onClick: (slotId: number) => void): void {
    slots.forEach((slot) => {
      const box = this.scene.add
        .rectangle(slot.x, slot.y, 56, 56, visualPolicy.slotFillColor, 0.35)
        .setStrokeStyle(2, visualPolicy.slotBorderColor)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => onClick(slot.id));

      const plusLabel = this.scene.add
        .text(slot.x, slot.y, '+', {
          color: '#dceffd',
          fontFamily: 'sans-serif',
          fontSize: '28px',
        })
        .setOrigin(0.5);

      this.slotVisuals.set(slot.id, { box, plusLabel });
    });
  }

  sync(towers: Map<number, Tower>): void {
    const activeSlots = new Set(towers.keys());

    towers.forEach((tower, slotIndex) => {
      const slotVisual = this.slotVisuals.get(slotIndex);
      if (slotVisual) {
        slotVisual.plusLabel.setVisible(false);
      }

      const existing = this.towerVisuals.get(slotIndex);
      if (existing) {
        existing.body.setFillStyle(getTowerColor(tower.config.id));
        existing.label.setText(tower.config.name);
        return;
      }

      const body = this.scene.add
        .rectangle(tower.position.x, tower.position.y, 40, 40, getTowerColor(tower.config.id), 1)
        .setStrokeStyle(2, 0xffffff);
      const label = this.scene.add
        .text(tower.position.x, tower.position.y + 30, tower.config.name, {
          color: '#ffffff',
          fontFamily: 'sans-serif',
          fontSize: '12px',
        })
        .setOrigin(0.5);
      this.towerVisuals.set(slotIndex, { body, label });
    });

    this.slotVisuals.forEach((slotVisual, slotId) => {
      slotVisual.plusLabel.setVisible(!activeSlots.has(slotId));
    });

    [...this.towerVisuals.keys()]
      .filter((slotIndex) => !activeSlots.has(slotIndex))
      .forEach((slotIndex) => {
        const visual = this.towerVisuals.get(slotIndex);
        visual?.body.destroy();
        visual?.label.destroy();
        this.towerVisuals.delete(slotIndex);
      });
  }

  destroy(): void {
    this.slotVisuals.forEach(({ box, plusLabel }) => {
      box.destroy();
      plusLabel.destroy();
    });
    this.towerVisuals.forEach(({ body, label }) => {
      body.destroy();
      label.destroy();
    });
    this.slotVisuals.clear();
    this.towerVisuals.clear();
  }
}
