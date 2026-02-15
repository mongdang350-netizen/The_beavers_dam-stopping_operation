import Phaser from 'phaser';
import { createTextButton } from '@/ui/TextButton';

export class SpeedControl {
  private readonly speedButton: Phaser.GameObjects.Text;
  private readonly pauseButton: Phaser.GameObjects.Text;

  constructor(
    scene: Phaser.Scene,
    onSpeedToggle: () => void,
    onPauseToggle: () => void,
  ) {
    this.speedButton = createTextButton(scene, {
      x: 1080,
      y: 640,
      label: '1x/2x',
      onClick: onSpeedToggle,
      style: {
        color: '#111111',
        backgroundColor: '#bbdefb',
        fontFamily: 'sans-serif',
        fontSize: '18px',
        padding: { x: 8, y: 6 },
      },
      depth: 1000,
    });

    this.pauseButton = createTextButton(scene, {
      x: 1160,
      y: 640,
      label: 'PAUSE',
      onClick: onPauseToggle,
      style: {
        color: '#111111',
        backgroundColor: '#ffcdd2',
        fontFamily: 'sans-serif',
        fontSize: '18px',
        padding: { x: 8, y: 6 },
      },
      depth: 1000,
    });
  }

  destroy(): void {
    this.speedButton.destroy();
    this.pauseButton.destroy();
  }
}
