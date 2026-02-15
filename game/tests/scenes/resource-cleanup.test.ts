import { ResourceCleanup } from '@/scenes/resourceCleanup';

describe('ResourceCleanup', () => {
  it('runs tracked disposers once and clears them', () => {
    const tracker = new ResourceCleanup();
    let count = 0;
    tracker.track(() => {
      count += 1;
    });
    tracker.track(() => {
      count += 1;
    });

    tracker.disposeAll();
    tracker.disposeAll();

    expect(count).toBe(2);
  });
});
