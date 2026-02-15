import { shouldShowDebugPanel } from '@/debug/debugVisibility';

describe('shouldShowDebugPanel', () => {
  it('shows debug panel only in DEV mode', () => {
    expect(shouldShowDebugPanel(true)).toBe(true);
    expect(shouldShowDebugPanel(false)).toBe(false);
  });
});
