import Phaser from 'phaser';
import { SCENE_KEYS } from '@/scenes/sceneKeys';
import { createTextButton } from '@/ui/TextButton';
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
    const stars = data.stars ?? 1;

    this.cameras.main.setBackgroundColor('#10251a');

    this.add
      .text(GAME_WIDTH / 2, 150, '클리어!', {
        color: '#ffffff',
        fontFamily: 'sans-serif',
        fontSize: '58px',
        stroke: '#000000',
        strokeThickness: 6,
      })
      .setOrigin(0.5);

    const starText = this.add
      .text(GAME_WIDTH / 2, 250, '★'.repeat(Math.max(1, Math.min(3, stars))), {
        color: '#ffd54f',
        fontFamily: 'sans-serif',
        fontSize: '64px',
      })
      .setOrigin(0.5)
      .setScale(0.2);

    this.tweens.add({ targets: starText, scale: 1, duration: 400, ease: 'Back.Out' });

    this.add
      .text(GAME_WIDTH / 2, 340, `점수: ${score}`, {
        color: '#ffffff',
        fontFamily: 'sans-serif',
        fontSize: '30px',
      })
      .setOrigin(0.5);

    createTextButton(this, {
      x: GAME_WIDTH / 2,
      y: GAME_HEIGHT / 2 + 80,
      label: '재시작',
      onClick: () => {
        this.scene.start(SCENE_KEYS.GAME);
      },
      style: {
        color: '#111111',
        backgroundColor: '#ffe082',
        fontFamily: 'sans-serif',
        fontSize: '24px',
        padding: { x: 12, y: 8 },
      },
    });
    createTextButton(this, {
      x: GAME_WIDTH / 2,
      y: GAME_HEIGHT / 2 + 150,
      label: '메인 메뉴',
      onClick: () => {
        this.scene.start(SCENE_KEYS.MENU);
      },
      style: {
        color: '#111111',
        backgroundColor: '#ffe082',
        fontFamily: 'sans-serif',
        fontSize: '24px',
        padding: { x: 12, y: 8 },
      },
    });
  }
}
