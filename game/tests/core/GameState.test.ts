import { EventBus } from '@/core/EventBus';
import { GameState } from '@/core/GameState';
import { GoldManager } from '@/core/GoldManager';
import type { GameEvents } from '@/types';

describe('GameState', () => {
  it('initializes with expected defaults', () => {
    const bus = new EventBus<GameEvents>();
    const gold = new GoldManager(bus, 220);
    const state = new GameState(bus, gold);

    expect(state.gold).toBe(220);
    expect(state.damHp).toBe(200);
    expect(state.currentStage).toBe(1);
    expect(state.currentWave).toBe(1);
    expect(state.gameStatus).toBe('menu');
  });

  it('tracks gold changes through event bus', () => {
    const bus = new EventBus<GameEvents>();
    const gold = new GoldManager(bus, 220);
    const state = new GameState(bus, gold);

    gold.earn(10);

    expect(state.gold).toBe(230);
    expect(state.totalGoldEarned).toBe(10);
  });

  it('emits gameOver when dam hp reaches zero', () => {
    const bus = new EventBus<GameEvents>();
    const gold = new GoldManager(bus, 220);
    const state = new GameState(bus, gold);
    const over = vi.fn();

    bus.on('gameOver', over);
    state.damageDam(200);

    expect(state.gameStatus).toBe('gameOver');
    expect(over).toHaveBeenCalledTimes(1);
  });

  it('resets mutable runtime state', () => {
    const bus = new EventBus<GameEvents>();
    const gold = new GoldManager(bus, 220);
    const state = new GameState(bus, gold);

    gold.spend(50);
    state.damageDam(50);
    state.advanceStage();
    state.advanceWave();
    state.setStatus('playing');
    state.setSpeed(2);
    state.reset();

    expect(state.gold).toBe(220);
    expect(gold.getBalance()).toBe(220);
    expect(state.damHp).toBe(200);
    expect(state.currentStage).toBe(1);
    expect(state.currentWave).toBe(1);
    expect(state.speed).toBe(1);
    expect(state.gameStatus).toBe('menu');
  });
});
