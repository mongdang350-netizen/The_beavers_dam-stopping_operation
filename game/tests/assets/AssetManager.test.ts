import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getTextureKey, getSpriteSheetKey, getAnimationKey } from '@/assets/AssetDescriptor';

// Mock Phaser to avoid DOM dependencies
vi.mock('phaser', () => ({
  default: {},
}));

// Import AssetManager after mocking Phaser
const { AssetManager } = await import('@/assets/AssetManager');

describe('AssetDescriptor', () => {
  describe('getTextureKey', () => {
    it('should generate correct texture key', () => {
      const key = getTextureKey({ entity: 'tower', id: 'archer', state: 'idle' });
      expect(key).toBe('tower_archer_idle');
    });

    it('should handle different entities', () => {
      const key = getTextureKey({ entity: 'enemy', id: 'piranha', state: 'walk' });
      expect(key).toBe('enemy_piranha_walk');
    });
  });

  describe('getSpriteSheetKey', () => {
    it('should generate correct spritesheet key', () => {
      const key = getSpriteSheetKey('tower', 'archer', 'attack');
      expect(key).toBe('tower_archer_attack_sheet');
    });
  });

  describe('getAnimationKey', () => {
    it('should generate correct animation key', () => {
      const key = getAnimationKey('soldier', 'knight', 'cast');
      expect(key).toBe('anim_soldier_knight_cast');
    });
  });
});

describe('AssetManager', () => {
  let manager: InstanceType<typeof AssetManager>;

  beforeEach(() => {
    manager = new AssetManager();
  });

  describe('register', () => {
    it('should register an asset', () => {
      manager.register({
        entity: 'tower',
        id: 'archer',
        state: 'idle',
        frameCount: 4,
        frameWidth: 32,
        frameHeight: 32,
      });

      expect(manager.isRegistered('tower', 'archer', 'idle')).toBe(true);
    });

    it('should handle multiple registrations', () => {
      manager.register({
        entity: 'tower',
        id: 'archer',
        state: 'idle',
        frameCount: 4,
        frameWidth: 32,
        frameHeight: 32,
      });

      manager.register({
        entity: 'tower',
        id: 'archer',
        state: 'attack',
        frameCount: 6,
        frameWidth: 32,
        frameHeight: 32,
      });

      expect(manager.isRegistered('tower', 'archer', 'idle')).toBe(true);
      expect(manager.isRegistered('tower', 'archer', 'attack')).toBe(true);
    });
  });

  describe('isRegistered', () => {
    beforeEach(() => {
      manager.register({
        entity: 'tower',
        id: 'archer',
        state: 'idle',
        frameCount: 4,
        frameWidth: 32,
        frameHeight: 32,
      });
    });

    it('should return true for registered assets', () => {
      expect(manager.isRegistered('tower', 'archer', 'idle')).toBe(true);
    });

    it('should return false for unregistered assets', () => {
      expect(manager.isRegistered('tower', 'archer', 'walk')).toBe(false);
      expect(manager.isRegistered('enemy', 'piranha', 'idle')).toBe(false);
    });
  });

  describe('getAnimConfig', () => {
    beforeEach(() => {
      manager.register({
        entity: 'tower',
        id: 'archer',
        state: 'idle',
        frameCount: 4,
        frameWidth: 32,
        frameHeight: 32,
      });

      manager.register({
        entity: 'tower',
        id: 'archer',
        state: 'attack',
        frameCount: 6,
        frameWidth: 32,
        frameHeight: 32,
      });

      manager.register({
        entity: 'enemy',
        id: 'piranha',
        state: 'slither',
        frameCount: 3,
        frameWidth: 16,
        frameHeight: 16,
        frameRate: 10,
        loop: false,
      });
    });

    it('should return correct config for idle animation', () => {
      const config = manager.getAnimConfig('tower', 'archer', 'idle');

      expect(config).not.toBeNull();
      expect(config?.key).toBe('anim_tower_archer_idle');
      expect(config?.spriteSheetKey).toBe('tower_archer_idle_sheet');
      expect(config?.frameRate).toBe(4); // Default for idle
      expect(config?.repeat).toBe(-1); // Loop
      expect(config?.frames).toEqual([0, 1, 2, 3]);
    });

    it('should return correct config for attack animation', () => {
      const config = manager.getAnimConfig('tower', 'archer', 'attack');

      expect(config).not.toBeNull();
      expect(config?.frameRate).toBe(8); // Default for attack
      expect(config?.repeat).toBe(0); // No loop
      expect(config?.frames).toEqual([0, 1, 2, 3, 4, 5]);
    });

    it('should respect custom frameRate and loop settings', () => {
      const config = manager.getAnimConfig('enemy', 'piranha', 'slither');

      expect(config?.frameRate).toBe(10); // Custom
      expect(config?.repeat).toBe(0); // Custom (no loop)
    });

    it('should return null for unregistered assets', () => {
      const config = manager.getAnimConfig('tower', 'archer', 'walk');
      expect(config).toBeNull();
    });
  });

  describe('getStates', () => {
    beforeEach(() => {
      manager.register({
        entity: 'tower',
        id: 'archer',
        state: 'idle',
        frameCount: 4,
        frameWidth: 32,
        frameHeight: 32,
      });

      manager.register({
        entity: 'tower',
        id: 'archer',
        state: 'attack',
        frameCount: 6,
        frameWidth: 32,
        frameHeight: 32,
      });

      manager.register({
        entity: 'tower',
        id: 'archer',
        state: 'walk',
        frameCount: 4,
        frameWidth: 32,
        frameHeight: 32,
      });
    });

    it('should return all registered states for an entity', () => {
      const states = manager.getStates('tower', 'archer');

      expect(states).toHaveLength(3);
      expect(states).toContain('idle');
      expect(states).toContain('attack');
      expect(states).toContain('walk');
    });

    it('should return empty array for unregistered entity', () => {
      const states = manager.getStates('enemy', 'piranha');
      expect(states).toEqual([]);
    });
  });

  describe('getSheetKey', () => {
    it('should return correct spritesheet key', () => {
      const key = manager.getSheetKey('tower', 'archer', 'idle');
      expect(key).toBe('tower_archer_idle_sheet');
    });
  });
});
