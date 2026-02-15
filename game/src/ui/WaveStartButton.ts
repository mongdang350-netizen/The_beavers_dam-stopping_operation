import Phaser from 'phaser';
import { textsData } from '@/data/validatedData';
import { createTextButton } from '@/ui/TextButton';

export class WaveStartButton {
  private readonly button: Phaser.GameObjects.Text;

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
  }

  setVisible(value: boolean): void {
    this.button.setVisible(value);
  }

  destroy(): void {
    this.button.destroy();
  }
}
