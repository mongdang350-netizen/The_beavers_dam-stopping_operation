import { EventBus } from '@/core/EventBus';
import type { GameEvents } from '@/types';

describe('EventBus', () => {
  it('publishes event data to listeners', () => {
    const bus = new EventBus<GameEvents>();
    const listener = vi.fn();

    bus.on('enemyKilled', listener);
    bus.emit('enemyKilled', { enemyId: 'e1', goldEarned: 12 });

    expect(listener).toHaveBeenCalledWith({ enemyId: 'e1', goldEarned: 12 });
  });

  it('supports multiple listeners', () => {
    const bus = new EventBus<GameEvents>();
    const one = vi.fn();
    const two = vi.fn();

    bus.on('stageStart', one);
    bus.on('stageStart', two);
    bus.emit('stageStart', { stageId: 1 });

    expect(one).toHaveBeenCalledTimes(1);
    expect(two).toHaveBeenCalledTimes(1);
  });

  it('removes listeners', () => {
    const bus = new EventBus<GameEvents>();
    const listener = vi.fn();

    const unsubscribe = bus.on('gameOver', listener);
    unsubscribe();
    bus.emit('gameOver', {});

    expect(listener).not.toHaveBeenCalled();
  });

  it('supports once listeners', () => {
    const bus = new EventBus<GameEvents>();
    const listener = vi.fn();

    bus.once('waveEnd', listener);
    bus.emit('waveEnd', { stageId: 1, waveIndex: 1 });
    bus.emit('waveEnd', { stageId: 1, waveIndex: 2 });

    expect(listener).toHaveBeenCalledTimes(1);
  });
});
