import Phaser from 'phaser';
import { textsData } from '@/data/validatedData';
import { createTextButton } from '@/ui/TextButton';
import type { WaveState } from '@/systems/WaveSystem';

export class WaveStartButton {
  private readonly button: Phaser.GameObjects.Text;
  private readonly countdownText: Phaser.GameObjects.Text;

  constructor(
    scene: Phaser.Scene,
    onClick: () => void,
  ) {
    this.button = createTextButton(scene, {
      x: 640,
      y: 680,
      label: textsData.ko.nextWave,
      onClick,
      style: {
        color: '#111111',
        backgroundColor: '#ffe082',
        fontFamily: 'sans-serif',
        fontSize: '26px',
        padding: { x: 14, y: 8 },
      },
      depth: 1000,
    });

    this.countdownText = scene.add
      .text(640, 680, '', {
        color: '#ffffff',
        backgroundColor: '#ff6b6b',
        fontFamily: 'sans-serif',
        fontSize: '26px',
        padding: { x: 14, y: 8 },
      })
      .setOrigin(0.5)
      .setDepth(1000)
      .setVisible(false);
  }

  update(state: WaveState, countdown: number): void {
    if (state === 'preparing') {
      this.button.setVisible(true);
      this.countdownText.setVisible(false);
    } else if (state === 'countdown') {
      this.button.setVisible(false);
      this.countdownText.setVisible(true);
      const seconds = Math.ceil(countdown);
      this.countdownText.setText(`Next wave in ${seconds}...`);
    } else {
      this.button.setVisible(false);
      this.countdownText.setVisible(false);
    }
  }

  setVisible(value: boolean): void {
    this.button.setVisible(value);
    // Don't show countdownText here - it's managed by update()
    if (!value) {
      this.countdownText.setVisible(false);
    }
  }

  destroy(): void {
    this.button.destroy();
    this.countdownText.destroy();
  }
}
