import Phaser from 'phaser';
import { SCENE_KEYS } from '@/scenes/sceneKeys';
import { createTextButton } from '@/ui/TextButton';
import { GAME_HEIGHT, GAME_WIDTH } from '@/utils/constants';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.GAME_OVER);
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#2b0f12');

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 90, '게임 오버', {
        color: '#ffffff',
        fontFamily: 'sans-serif',
        fontSize: '56px',
        stroke: '#000000',
        strokeThickness: 6,
      })
      .setOrigin(0.5);

    createTextButton(this, {
      x: GAME_WIDTH / 2,
      y: GAME_HEIGHT / 2 + 10,
      label: '재시작',
      onClick: () => {
        this.scene.start(SCENE_KEYS.GAME);
      },
      style: {
        color: '#111111',
        backgroundColor: '#ffcc80',
        fontFamily: 'sans-serif',
        fontSize: '26px',
        padding: { x: 12, y: 8 },
      },
    });

    createTextButton(this, {
      x: GAME_WIDTH / 2,
      y: GAME_HEIGHT / 2 + 80,
      label: '메인 메뉴',
      onClick: () => {
        this.scene.start(SCENE_KEYS.MENU);
      },
      style: {
        color: '#111111',
        backgroundColor: '#ffcc80',
        fontFamily: 'sans-serif',
        fontSize: '26px',
        padding: { x: 12, y: 8 },
      },
    });
  }
}
