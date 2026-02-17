import Phaser from 'phaser';
import { SCENE_KEYS } from '@/scenes/sceneKeys';
import { GAME_HEIGHT, GAME_WIDTH } from '@/utils/constants';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.GAME_OVER);
  }

  create(): void {
    // Dark red background
    this.cameras.main.setBackgroundColor('#3E1111');

    // Title with pastel red styling
    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 90, '게임 오버', {
        color: '#EF5350',
        fontFamily: '"Jua", "Fredoka One", sans-serif',
        fontSize: '48px',
      })
      .setOrigin(0.5);

    // Message text
    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 20, '댐이 파괴되었습니다...', {
        color: '#FFF8E7',
        fontFamily: '"Gothic A1", sans-serif',
        fontSize: '20px',
      })
      .setOrigin(0.5);

    // Retry button - pastel green
    this.createPastelButton(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 40, '재시작', 0xA5D6A7, () => {
      this.scene.start(SCENE_KEYS.GAME);
    });

    // Menu button - pastel gold
    this.createPastelButton(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 110, '메인 메뉴', 0xFFE082, () => {
      this.scene.start(SCENE_KEYS.MENU);
    });
  }

  private createPastelButton(x: number, y: number, label: string, bgColor: number, onClick: () => void): void {
    const bg = this.add.graphics();
    bg.fillStyle(bgColor, 1);
    bg.fillRoundedRect(x - 100, y - 25, 200, 50, 12);

    const text = this.add
      .text(x, y, label, {
        color: '#3E2723',
        fontFamily: '"Gothic A1", sans-serif',
        fontSize: '22px',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', onClick);

    text.on('pointerover', () => {
      this.tweens.add({ targets: text, scale: 1.1, duration: 100 });
    });
    text.on('pointerout', () => {
      this.tweens.add({ targets: text, scale: 1, duration: 100 });
    });
  }
}
