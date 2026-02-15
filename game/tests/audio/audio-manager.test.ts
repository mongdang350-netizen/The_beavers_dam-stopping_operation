import { AudioManager } from '@/audio/AudioManager';

describe('AudioManager', () => {
  it('stores BGM/SFX volume and mute flags', () => {
    const manager = new AudioManager();

    manager.setBgmVolume(0.8);
    manager.setSfxVolume(0.4);
    manager.setMuted(true);

    expect(manager.getSettings()).toEqual({
      bgmVolume: 0.8,
      sfxVolume: 0.4,
      muted: true,
    });
  });

  it('clamps volume into 0..1 range', () => {
    const manager = new AudioManager();

    manager.setBgmVolume(2);
    manager.setSfxVolume(-1);

    expect(manager.getSettings().bgmVolume).toBe(1);
    expect(manager.getSettings().sfxVolume).toBe(0);
  });

  it('does not restart same BGM track and tracks latest SFX event', () => {
    const manager = new AudioManager();

    manager.playBgm('game');
    manager.playBgm('game');
    manager.playSfx('waveStart');

    expect(manager.getActiveBgm()).toBe('game');
    expect(manager.getLastSfx()).toBe('waveStart');
  });

  it('supports delta-based volume controls and mute toggle', () => {
    const manager = new AudioManager();

    manager.adjustBgmVolume(0.2);
    manager.adjustSfxVolume(-0.3);
    manager.toggleMuted();

    const settings = manager.getSettings();
    expect(settings.bgmVolume).toBeCloseTo(0.7);
    expect(settings.sfxVolume).toBeCloseTo(0.4);
    expect(settings.muted).toBe(true);
  });
});
