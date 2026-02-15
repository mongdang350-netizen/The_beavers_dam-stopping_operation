import Phaser from 'phaser';

export interface TextButtonOptions {
  x: number;
  y: number;
  label: string;
  onClick: () => void;
  style: Phaser.Types.GameObjects.Text.TextStyle;
  depth?: number;
  origin?: number;
}

export const createTextButton = (
  scene: Phaser.Scene,
  options: TextButtonOptions,
): Phaser.GameObjects.Text => {
  return scene.add
    .text(options.x, options.y, options.label, options.style)
    .setOrigin(options.origin ?? 0.5)
    .setDepth(options.depth ?? 0)
    .setInteractive({ useHandCursor: true })
    .on('pointerdown', () => options.onClick());
};
