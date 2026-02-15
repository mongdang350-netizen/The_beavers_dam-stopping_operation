import Phaser from 'phaser';
import { DebugController } from '@/debug/DebugController';
import { createTextButton } from '@/ui/TextButton';

export class DebugPanel {
  private readonly buttons: Phaser.GameObjects.Text[] = [];

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly controller: DebugController,
  ) {
    this.buttons.push(this.createButton(16, 520, '+1000G', () => this.controller.addGold(1000)));
    this.buttons.push(this.createButton(16, 555, 'Wave Skip', () => this.controller.skipWave()));
    this.buttons.push(this.createButton(16, 590, 'Stage Skip', () => this.controller.skipStage()));
    this.buttons.push(this.createButton(16, 625, 'Speed 1x', () => this.controller.setSpeed(1)));
    this.buttons.push(this.createButton(16, 660, 'Speed 2x', () => this.controller.setSpeed(2)));
    this.buttons.push(this.createButton(110, 625, 'Kill All', () => this.controller.killAllEnemies()));
    this.buttons.push(this.createButton(110, 660, 'Dam Reset', () => this.controller.resetDamHp()));
  }

  destroy(): void {
    this.buttons.forEach((button) => button.destroy());
    this.buttons.length = 0;
  }

  private createButton(
    x: number,
    y: number,
    label: string,
    onClick: () => void,
  ): Phaser.GameObjects.Text {
    return createTextButton(this.scene, {
      x,
      y,
      label,
      onClick,
      style: {
        color: '#111111',
        backgroundColor: '#f8bbd0',
        fontFamily: 'sans-serif',
        fontSize: '13px',
        padding: { x: 6, y: 4 },
      },
      depth: 1400,
      origin: 0,
    });
  }
}
