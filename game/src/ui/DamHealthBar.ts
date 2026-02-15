import Phaser from 'phaser';

export class DamHealthBar {
  private readonly bg: Phaser.GameObjects.Rectangle;
  private readonly fill: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number) {
    this.bg = scene.add
      .rectangle(x, y, width, height, 0x111111, 0.9)
      .setOrigin(0.5)
      .setStrokeStyle(2, 0xffffff);
    this.fill = scene.add.rectangle(x - width / 2, y, width, height - 4, 0x2ecc71, 1).setOrigin(0, 0.5);
  }

  setValue(current: number, max: number): void {
    const ratio = max <= 0 ? 0 : Math.max(0, Math.min(1, current / max));
    const width = this.bg.width - 4;
    this.fill.width = width * ratio;

    if (ratio <= 0.3) {
      this.fill.setFillStyle(0xe74c3c, 1);
      return;
    }
    if (ratio <= 0.6) {
      this.fill.setFillStyle(0xf1c40f, 1);
      return;
    }
    this.fill.setFillStyle(0x2ecc71, 1);
  }

  destroy(): void {
    this.bg.destroy();
    this.fill.destroy();
  }
}
