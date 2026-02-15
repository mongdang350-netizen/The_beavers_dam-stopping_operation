export interface AudioSettings {
  bgmVolume: number;
  sfxVolume: number;
  muted: boolean;
}

export type BgmTrack = 'menu' | 'game' | 'boss';
export type SfxEvent =
  | 'placeTower'
  | 'upgradeTower'
  | 'sellTower'
  | 'enemyDefeated'
  | 'bossWarning'
  | 'waveStart'
  | 'damHit'
  | 'gameOver'
  | 'victory';

const clamp01 = (value: number): number => Math.max(0, Math.min(1, value));

export class AudioManager {
  private settings: AudioSettings = {
    bgmVolume: 0.5,
    sfxVolume: 0.7,
    muted: false,
  };
  private activeBgm: BgmTrack | null = null;
  private lastSfx: SfxEvent | null = null;

  setBgmVolume(value: number): void {
    this.settings.bgmVolume = clamp01(value);
  }

  setSfxVolume(value: number): void {
    this.settings.sfxVolume = clamp01(value);
  }

  setMuted(value: boolean): void {
    this.settings.muted = value;
  }

  toggleMuted(): void {
    this.settings.muted = !this.settings.muted;
  }

  adjustBgmVolume(delta: number): void {
    this.setBgmVolume(this.settings.bgmVolume + delta);
  }

  adjustSfxVolume(delta: number): void {
    this.setSfxVolume(this.settings.sfxVolume + delta);
  }

  getSettings(): AudioSettings {
    return { ...this.settings };
  }

  playBgm(track: BgmTrack): void {
    if (this.settings.muted) {
      this.activeBgm = null;
      return;
    }
    if (this.activeBgm === track) {
      return;
    }
    this.activeBgm = track;
  }

  stopBgm(): void {
    this.activeBgm = null;
  }

  playSfx(event: SfxEvent): void {
    if (this.settings.muted) {
      return;
    }
    this.lastSfx = event;
  }

  getActiveBgm(): BgmTrack | null {
    return this.activeBgm;
  }

  getLastSfx(): SfxEvent | null {
    return this.lastSfx;
  }
}
