import Phaser from 'phaser';
import { BootScene } from '@/scenes/BootScene';
import { GameOverScene } from '@/scenes/GameOverScene';
import { GameScene } from '@/scenes/GameScene';
import { MenuScene } from '@/scenes/MenuScene';
import { VictoryScene } from '@/scenes/VictoryScene';
import { GAME_HEIGHT, GAME_WIDTH } from '@/utils/constants';

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: 'game',
  backgroundColor: '#000000',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  input: {
    touch: true,
  },
  scene: [BootScene, MenuScene, GameScene, GameOverScene, VictoryScene],
};
