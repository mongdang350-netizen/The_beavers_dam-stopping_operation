import { GameSession } from '@/scenes/GameSession';

describe('GameSession', () => {
  it('starts in preparing state and can start a wave', () => {
    const session = new GameSession();

    expect(session.gameState.gameStatus).toBe('preparing');
    expect(session.gameState.currentStage).toBe(1);
    expect(session.gameState.currentWave).toBe(1);

    expect(session.startWave()).toBe(true);
    expect(session.gameState.gameStatus).toBe('playing');
  });

  it('supports placement, speed toggle and pause toggle inputs', () => {
    const session = new GameSession();

    expect(session.placeTower(0, 'agile')).toBe(true);
    expect(session.placeTower(0, 'capable')).toBe(false);

    expect(session.gameState.speed).toBe(1);
    session.toggleSpeed();
    expect(session.gameState.speed).toBe(2);
    session.toggleSpeed();
    expect(session.gameState.speed).toBe(1);

    expect(session.gameState.gameStatus).toBe('preparing');
    session.togglePause();
    expect(session.gameState.gameStatus).toBe('paused');
    session.togglePause();
    expect(session.gameState.gameStatus).toBe('preparing');
  });

  it('spawns enemies after starting a wave and updating loop', () => {
    const session = new GameSession();
    session.startWave();

    expect(session.gameState.enemies).toHaveLength(0);
    session.update(0.5);
    expect(session.gameState.enemies.length).toBeGreaterThan(0);
  });
});
