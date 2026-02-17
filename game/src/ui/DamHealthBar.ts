import Phaser from 'phaser';

export class DamHealthBar {
  private readonly bg: Phaser.GameObjects.Rectangle;
  private readonly fill: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number) {
    this.bg = scene.add
      .rectangle(x, y, width, height, 0x4e342e, 0.8)
      .setOrigin(0.5)
      .setStrokeStyle(2, 0xffffff);
    this.fill = scene.add.rectangle(x - width / 2, y, width, height - 4, 0x66bb6a, 1).setOrigin(0, 0.5);
  }

  setValue(current: number, max: number): void {
    const ratio = max <= 0 ? 0 : Math.max(0, Math.min(1, current / max));
    const width = this.bg.width - 4;
    this.fill.width = width * ratio;

    if (current <= 0.25 * max) {
      this.fill.setFillStyle(0xef5350, 1);
      return;
    }
    if (current <= 0.5 * max) {
      this.fill.setFillStyle(0xff9800, 1);
      return;
    }
    if (current <= 0.75 * max) {
      this.fill.setFillStyle(0xffd54f, 1);
      return;
    }
    this.fill.setFillStyle(0x66bb6a, 1);
  }

  destroy(): void {
    this.bg.destroy();
    this.fill.destroy();
  }
}
