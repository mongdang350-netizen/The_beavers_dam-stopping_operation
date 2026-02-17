import Phaser from 'phaser';
import { createSpriteSheet, createTexture } from '@/assets/PixelArtEngine';
import type { PixelData } from '@/assets/PixelArtEngine';
import { assetManager } from '@/assets/AssetManager';
import type { AnimationState } from '@/assets/AssetDescriptor';
import { towerPixelArt } from '@/assets/pixelart/towers';
import { enemyPixelArt } from '@/assets/pixelart/enemies';
import { soldierPixelArt } from '@/assets/pixelart/soldiers';
import { projectilePixelArt } from '@/assets/pixelart/effects';
import {
  grassTile1, grassTile2, grassTile3,
  riverStraightFrames, riverCurveFrames, riverMergeFrames,
  tree1, tree2, stump, barrier,
} from '@/assets/pixelart/tiles';
import { damStages, babyBeaverExpressions } from '@/assets/pixelart/dam';

/** Tower frame dimensions */
const TOWER_FRAME_SIZE = 48;

/** Soldier frame dimensions */
const SOLDIER_FRAME_SIZE = 32;

/**
 * Detect frame dimensions from pixel data.
 * Falls back to 48x48 if frames are empty.
 */
function getFrameDimensions(frames: readonly PixelData[]): { width: number; height: number } {
  const first = frames[0];
  return {
    height: first?.length ?? 48,
    width: first?.[0]?.length ?? 48,
  };
}

/**
 * Map from tower config.id (sourceType) to projectile pixel art key.
 * Towers that don't fire projectiles (brave, barbarian, capable, knight) are omitted.
 */
const towerToProjectileMap: Record<string, string> = {
  agile: 'stone',
  archer: 'arrow',
  blowgunner: 'dart',
  smart: 'bomb',
  dragonTamer: 'fireball',
  wizard: 'lightning',
  logRoller: 'log',
  waterBomber: 'waterBomb',
};

/**
 * Register all sprite sheets and textures for the game.
 * Must be called once during scene create(), before any renderers are instantiated.
 */
export function registerAllTextures(scene: Phaser.Scene): void {
  registerTowerTextures(scene);
  registerEnemyTextures(scene);
  registerSoldierTextures(scene);
  registerProjectileTextures(scene);
  registerTileTextures(scene);
  registerDamTextures(scene);

  // Create all Phaser animations from registered assets
  assetManager.createAnimations(scene);
}

function registerTowerTextures(scene: Phaser.Scene): void {
  for (const [id, art] of Object.entries(towerPixelArt)) {
    // Idle spritesheet (2 frames)
    createSpriteSheet(scene, `tower_${id}_idle_sheet`, art.idle, TOWER_FRAME_SIZE, TOWER_FRAME_SIZE);
    assetManager.register({
      entity: 'tower',
      id,
      state: 'idle' as AnimationState,
      frameCount: art.idle.length,
      frameWidth: TOWER_FRAME_SIZE,
      frameHeight: TOWER_FRAME_SIZE,
    });

    // Action/attack spritesheet (3 frames)
    createSpriteSheet(scene, `tower_${id}_attack_sheet`, art.action, TOWER_FRAME_SIZE, TOWER_FRAME_SIZE);
    assetManager.register({
      entity: 'tower',
      id,
      state: 'attack' as AnimationState,
      frameCount: art.action.length,
      frameWidth: TOWER_FRAME_SIZE,
      frameHeight: TOWER_FRAME_SIZE,
    });
  }
}

function registerEnemyTextures(scene: Phaser.Scene): void {
  for (const [id, art] of Object.entries(enemyPixelArt)) {
    const walkSize = getFrameDimensions(art.walk);
    const attackSize = getFrameDimensions(art.attack);

    // Walk spritesheet
    createSpriteSheet(scene, `enemy_${id}_walk_sheet`, art.walk, walkSize.width, walkSize.height);
    assetManager.register({
      entity: 'enemy',
      id,
      state: 'walk' as AnimationState,
      frameCount: art.walk.length,
      frameWidth: walkSize.width,
      frameHeight: walkSize.height,
    });

    // Attack spritesheet
    createSpriteSheet(scene, `enemy_${id}_attack_sheet`, art.attack, attackSize.width, attackSize.height);
    assetManager.register({
      entity: 'enemy',
      id,
      state: 'attack' as AnimationState,
      frameCount: art.attack.length,
      frameWidth: attackSize.width,
      frameHeight: attackSize.height,
    });
  }
}

function registerSoldierTextures(scene: Phaser.Scene): void {
  for (const [id, art] of Object.entries(soldierPixelArt)) {
    // Walk spritesheet
    createSpriteSheet(scene, `soldier_${id}_walk_sheet`, art.walk, SOLDIER_FRAME_SIZE, SOLDIER_FRAME_SIZE);
    assetManager.register({
      entity: 'soldier',
      id,
      state: 'walk' as AnimationState,
      frameCount: art.walk.length,
      frameWidth: SOLDIER_FRAME_SIZE,
      frameHeight: SOLDIER_FRAME_SIZE,
    });

    // Attack spritesheet
    createSpriteSheet(scene, `soldier_${id}_attack_sheet`, art.attack, SOLDIER_FRAME_SIZE, SOLDIER_FRAME_SIZE);
    assetManager.register({
      entity: 'soldier',
      id,
      state: 'attack' as AnimationState,
      frameCount: art.attack.length,
      frameWidth: SOLDIER_FRAME_SIZE,
      frameHeight: SOLDIER_FRAME_SIZE,
    });
  }
}

function registerProjectileTextures(scene: Phaser.Scene): void {
  for (const [id, art] of Object.entries(projectilePixelArt)) {
    if (art.frames.length === 1) {
      // Single frame: create a simple texture
      createTexture(scene, `projectile_${id}`, art.frames[0]);
    } else {
      // Multiple frames: create spritesheet
      createSpriteSheet(scene, `projectile_${id}_sheet`, art.frames, art.size, art.size);
      assetManager.register({
        entity: 'effect',
        id: `proj_${id}`,
        state: 'idle' as AnimationState,
        frameCount: art.frames.length,
        frameWidth: art.size,
        frameHeight: art.size,
      });
    }
  }
}

function registerTileTextures(scene: Phaser.Scene): void {
  // Grass tile variants
  createTexture(scene, 'tile_grass_1', grassTile1);
  createTexture(scene, 'tile_grass_2', grassTile2);
  createTexture(scene, 'tile_grass_3', grassTile3);

  // River animation frames
  riverStraightFrames.forEach((frame, i) => {
    createTexture(scene, `tile_river_straight_${i}`, frame);
  });
  riverCurveFrames.forEach((frame, i) => {
    createTexture(scene, `tile_river_curve_${i}`, frame);
  });
  riverMergeFrames.forEach((frame, i) => {
    createTexture(scene, `tile_river_merge_${i}`, frame);
  });

  // Decorations
  createTexture(scene, 'tile_tree1', tree1);
  createTexture(scene, 'tile_tree2', tree2);
  createTexture(scene, 'tile_stump', stump);
  createTexture(scene, 'tile_barrier', barrier);
}

function registerDamTextures(scene: Phaser.Scene): void {
  // Dam stage textures (4 stages of damage)
  damStages.forEach((stageData, i) => {
    createTexture(scene, `dam_stage_${i}`, stageData);
  });

  // Baby beaver expression textures (4 expressions)
  babyBeaverExpressions.forEach((expression, i) => {
    createTexture(scene, `baby_beaver_${i}`, expression);
  });
}

/** Get the projectile texture key for a given tower sourceType */
export function getProjectileTextureKey(sourceType: string): string {
  const projectileId = towerToProjectileMap[sourceType];
  if (!projectileId) {
    return 'projectile_stone'; // fallback
  }
  const art = projectilePixelArt[projectileId];
  if (art && art.frames.length > 1) {
    return `projectile_${projectileId}_sheet`;
  }
  return `projectile_${projectileId}`;
}

/** Get projectile size for a given tower sourceType */
export function getProjectileSize(sourceType: string): number {
  const projectileId = towerToProjectileMap[sourceType];
  if (!projectileId) return 16;
  return projectilePixelArt[projectileId]?.size ?? 16;
}
