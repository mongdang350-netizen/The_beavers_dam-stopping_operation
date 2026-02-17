import Phaser from 'phaser';
import type { EntityType, AnimationState } from '@/assets/AssetDescriptor';
import { getSpriteSheetKey, getAnimationKey } from '@/assets/AssetDescriptor';

export interface AnimConfig {
  key: string;           // animation key
  spriteSheetKey: string; // texture key for the spritesheet
  frameRate: number;
  repeat: number;        // -1 for loop
  frames: number[];      // frame indices
}

export interface AssetRegistration {
  entity: EntityType;
  id: string;
  state: AnimationState;
  frameCount: number;
  frameWidth: number;
  frameHeight: number;
  frameRate?: number;  // defaults to 6
  loop?: boolean;      // defaults to true for idle/walk, false for attack
}

export class AssetManager {
  private readonly registry = new Map<string, AssetRegistration>();
  private readonly loadedScenes = new WeakSet<Phaser.Scene>();

  /** Register an asset (call during initialization, before scene create) */
  register(reg: AssetRegistration): void {
    const key = this.makeKey(reg.entity, reg.id, reg.state);
    this.registry.set(key, reg);
  }

  /** Get animation config for a specific entity state */
  getAnimConfig(entity: EntityType, id: string, state: AnimationState): AnimConfig | null {
    const key = this.makeKey(entity, id, state);
    const reg = this.registry.get(key);
    if (!reg) return null;

    const frameRate = reg.frameRate ?? this.getDefaultFrameRate(state);
    const loop = reg.loop ?? this.shouldLoop(state);

    return {
      key: getAnimationKey(entity, id, state),
      spriteSheetKey: getSpriteSheetKey(entity, id, state),
      frameRate,
      repeat: loop ? -1 : 0,
      frames: Array.from({ length: reg.frameCount }, (_, i) => i),
    };
  }

  /** Get all registered states for an entity */
  getStates(entity: EntityType, id: string): AnimationState[] {
    const states: AnimationState[] = [];
    const prefix = `${entity}_${id}_`;

    for (const key of this.registry.keys()) {
      if (key.startsWith(prefix)) {
        const state = key.slice(prefix.length) as AnimationState;
        states.push(state);
      }
    }

    return states;
  }

  /** Get the spritesheet texture key for an entity state */
  getSheetKey(entity: EntityType, id: string, state: AnimationState): string {
    return getSpriteSheetKey(entity, id, state);
  }

  /** Check if an asset is registered */
  isRegistered(entity: EntityType, id: string, state: AnimationState): boolean {
    const key = this.makeKey(entity, id, state);
    return this.registry.has(key);
  }

  /**
   * Create Phaser animations for all registered assets in a scene.
   * Only runs once per scene (idempotent).
   */
  createAnimations(scene: Phaser.Scene): void {
    if (this.loadedScenes.has(scene)) {
      return;
    }

    this.loadedScenes.add(scene);

    for (const reg of this.registry.values()) {
      const animKey = getAnimationKey(reg.entity, reg.id, reg.state);
      const sheetKey = getSpriteSheetKey(reg.entity, reg.id, reg.state);

      // Skip if animation already exists
      if (scene.anims.exists(animKey)) {
        continue;
      }

      const frameRate = reg.frameRate ?? this.getDefaultFrameRate(reg.state);
      const loop = reg.loop ?? this.shouldLoop(reg.state);

      scene.anims.create({
        key: animKey,
        frames: scene.anims.generateFrameNumbers(sheetKey, {
          start: 0,
          end: reg.frameCount - 1,
        }),
        frameRate,
        repeat: loop ? -1 : 0,
      });
    }
  }

  /** Get default frame rate based on animation state */
  private getDefaultFrameRate(state: AnimationState): number {
    switch (state) {
      case 'idle':
        return 4;
      case 'walk':
        return 6;
      case 'attack':
        return 8;
      case 'slither':
        return 5;
      default:
        return 6;
    }
  }

  /** Check if state should loop by default */
  private shouldLoop(state: AnimationState): boolean {
    const loopingStates: AnimationState[] = ['idle', 'walk', 'slither', 'farm', 'drink'];
    return loopingStates.includes(state);
  }

  /** Generate registry key */
  private makeKey(entity: EntityType, id: string, state: AnimationState): string {
    return `${entity}_${id}_${state}`;
  }
}

/** Singleton instance */
export const assetManager = new AssetManager();
