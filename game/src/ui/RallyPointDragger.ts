import Phaser from 'phaser';
import { RANGE_UNIT } from '@/utils/constants';

export class RallyPointDragger {
  private flag?: Phaser.GameObjects.Arc;
  private radiusGuide?: Phaser.GameObjects.Arc;
  private activeSlot: number | null = null;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly onMove: (slotIndex: number, x: number, y: number) => void,
  ) {}

  show(slotIndex: number, towerX: number, towerY: number): void {
    this.hide();
    this.activeSlot = slotIndex;

    this.radiusGuide = this.scene.add
      .circle(towerX, towerY, 2 * RANGE_UNIT, 0x90caf9, 0.1)
      .setStrokeStyle(2, 0x90caf9, 0.5)
      .setDepth(1100);

    this.flag = this.scene.add
      .circle(towerX, towerY, 10, 0xff7043)
      .setDepth(1101)
      .setInteractive({ draggable: true, useHandCursor: true });

    this.scene.input.setDraggable(this.flag, true);
    this.flag.on('drag', (pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
      if (this.activeSlot === null || !this.radiusGuide) {
        return;
      }
      const dx = dragX - towerX;
      const dy = dragY - towerY;
      const length = Math.hypot(dx, dy);
      const maxDist = 2 * RANGE_UNIT;
      const clampedX = length <= maxDist ? dragX : towerX + (dx / length) * maxDist;
      const clampedY = length <= maxDist ? dragY : towerY + (dy / length) * maxDist;
      this.flag?.setPosition(clampedX, clampedY);
      this.onMove(this.activeSlot, clampedX, clampedY);
      pointer.event.stopPropagation();
    });
  }

  hide(): void {
    this.activeSlot = null;
    this.flag?.destroy();
    this.radiusGuide?.destroy();
    this.flag = undefined;
    this.radiusGuide = undefined;
  }

  destroy(): void {
    this.hide();
  }
}
