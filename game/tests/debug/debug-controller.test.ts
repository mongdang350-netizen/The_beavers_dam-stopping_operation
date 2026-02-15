import { GameSession } from '@/scenes/GameSession';
import { DebugController } from '@/debug/DebugController';

describe('DebugController', () => {
  it('applies debug actions to session state', () => {
    const session = new GameSession();
    const debug = new DebugController(session);

    const beforeGold = session.gameState.gold;
    debug.addGold(1000);
    expect(session.gameState.gold).toBe(beforeGold + 1000);

    session.gameState.damHp = 10;
    debug.resetDamHp();
    expect(session.gameState.damHp).toBe(session.gameState.damMaxHp);

    session.startWave();
    session.update(0.5);
    expect(session.gameState.enemies.length).toBeGreaterThan(0);
    debug.killAllEnemies();
    expect(session.gameState.enemies).toHaveLength(0);

    debug.setSpeed(2);
    expect(session.gameState.speed).toBe(2);
    debug.setSpeed(1);
    expect(session.gameState.speed).toBe(1);
  });

  it('supports deterministic wave/stage skip helpers', () => {
    const session = new GameSession();
    const debug = new DebugController(session);

    expect(session.gameState.currentStage).toBe(1);
    expect(session.gameState.currentWave).toBe(1);

    debug.skipWave();
    expect(session.gameState.currentStage).toBe(1);
    expect(session.gameState.currentWave).toBe(2);

    debug.skipStage();
    expect(session.gameState.currentStage).toBe(2);
    expect(session.gameState.currentWave).toBe(1);
  });
});
