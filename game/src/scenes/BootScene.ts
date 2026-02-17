import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '@/utils/constants';
import { SCENE_KEYS } from '@/scenes/sceneKeys';

export class BootScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.BOOT);
  }

  preload(): void {
    const progressBg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 360, 24, 0x222222);
    const progressFill = this.add.rectangle(
      GAME_WIDTH / 2 - 176,
      GAME_HEIGHT / 2,
      0,
      16,
      0x66bb6a,
    );
    progressFill.setOrigin(0, 0.5);

    this.load.on('progress', (value: number) => {
      progressFill.width = 352 * value;
    });

    this.load.on('complete', () => {
      progressBg.destroy();
      progressFill.destroy();
    });
  }

  async create(): Promise<void> {
    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 60, 'Loading...', {
        color: '#ffffff',
        fontFamily: 'sans-serif',
        fontSize: '36px',
      })
      .setOrigin(0.5);

    // Wait for fonts to load with 3-second timeout
    const fontTimeout = new Promise<void>((resolve) =>
      setTimeout(() => {
        console.warn('Font loading timed out, using fallback');
        resolve();
      }, 3000),
    );
    await Promise.race([document.fonts.ready, fontTimeout]);

    this.time.delayedCall(80, () => {
      this.scene.start(SCENE_KEYS.MENU);
    });
  }
}
