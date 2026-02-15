import { EventBus } from '@/core/EventBus';
import { GoldManager } from '@/core/GoldManager';
import type { GameEvents } from '@/types';

describe('GoldManager', () => {
  it('spends and earns gold with events', () => {
    const bus = new EventBus<GameEvents>();
    const manager = new GoldManager(bus, 220);
    const listener = vi.fn();

    bus.on('goldChanged', listener);

    expect(manager.spend(100)).toBe(true);
    manager.earn(12);

    expect(manager.getBalance()).toBe(132);
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it('fails when balance is insufficient', () => {
    const bus = new EventBus<GameEvents>();
    const manager = new GoldManager(bus, 20);

    expect(manager.spend(21)).toBe(false);
    expect(manager.getBalance()).toBe(20);
  });

  it('calculates 50 percent refund', () => {
    const bus = new EventBus<GameEvents>();
    const manager = new GoldManager(bus, 220);

    expect(manager.calculateRefund(101)).toBe(50);
  });

  it('resets to initial gold and emits event', () => {
    const bus = new EventBus<GameEvents>();
    const manager = new GoldManager(bus, 220);
    const listener = vi.fn();
    bus.on('goldChanged', listener);

    manager.spend(100);
    manager.reset();

    expect(manager.getBalance()).toBe(220);
    expect(listener).toHaveBeenCalledTimes(2);
  });
});
