import Phaser from 'phaser';
import { SCENE_KEYS } from '@/scenes/sceneKeys';
import { GAME_HEIGHT, GAME_WIDTH } from '@/utils/constants';

interface VictoryData {
  score?: number;
  stars?: number;
}

export class VictoryScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.VICTORY);
  }

  create(data: VictoryData): void {
    const score = data.score ?? 0;
    const stars = Math.max(1, Math.min(3, data.stars ?? 1));

    // Warm dark green background
    this.cameras.main.setBackgroundColor('#1A3A2A');

    // Victory title
    this.add
      .text(GAME_WIDTH / 2, 150, '승리!', {
        color: '#FFD54F',
        fontFamily: '"Jua", "Fredoka One", sans-serif',
        fontSize: '54px',
      })
      .setOrigin(0.5);

    // Star rating with animation
    const starText = this.add
      .text(GAME_WIDTH / 2, 250, '★'.repeat(stars) + '☆'.repeat(3 - stars), {
        color: '#FFD54F',
        fontFamily: 'sans-serif',
        fontSize: '48px',
      })
      .setOrigin(0.5)
      .setScale(0.2);

    this.tweens.add({
      targets: starText,
      scale: 1,
      duration: 400,
      ease: 'Back.Out'
    });

    // Score display
    this.add
      .text(GAME_WIDTH / 2, 340, `점수: ${score}`, {
        color: '#FFF8E7',
        fontFamily: '"Gothic A1", sans-serif',
        fontSize: '28px',
      })
      .setOrigin(0.5);

    // Next Stage button - pastel green
    this.createPastelButton(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 60, '다음 스테이지', 0xA5D6A7, () => {
      // For now, restart the same stage. Can be enhanced to progress to next stage
      this.scene.start(SCENE_KEYS.GAME);
    });

    // Menu button - pastel gold
    this.createPastelButton(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 130, '메인 메뉴', 0xFFE082, () => {
      this.scene.start(SCENE_KEYS.MENU);
    });
  }

  private createPastelButton(x: number, y: number, label: string, bgColor: number, onClick: () => void): void {
    const bg = this.add.graphics();
    bg.fillStyle(bgColor, 1);
    bg.fillRoundedRect(x - 110, y - 25, 220, 50, 12);

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
