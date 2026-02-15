import Phaser from 'phaser';
import { gameConfig } from '@/config';

declare global {
  interface Window {
    __BEAVER_GAME__?: Phaser.Game;
  }
}

const startGame = (): void => {
  if (window.__BEAVER_GAME__) {
    window.__BEAVER_GAME__.destroy(true);
  }

  window.__BEAVER_GAME__ = new Phaser.Game(gameConfig);
};

startGame();

if (import.meta.hot) {
  import.meta.hot.accept(() => {
    startGame();
  });
}
