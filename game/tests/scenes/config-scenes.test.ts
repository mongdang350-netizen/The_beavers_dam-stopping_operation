import { SCENE_KEYS } from '@/scenes/sceneKeys';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('gameConfig scenes', () => {
  it('config file references boot/menu/game/gameover/victory scenes', () => {
    const configPath = resolve(process.cwd(), 'src/config.ts');
    const source = readFileSync(configPath, 'utf8');

    expect(source).toContain('BootScene');
    expect(source).toContain('MenuScene');
    expect(source).toContain('GameScene');
    expect(source).toContain('GameOverScene');
    expect(source).toContain('VictoryScene');
    expect(SCENE_KEYS.GAME).toBe('Game');
  });
});
