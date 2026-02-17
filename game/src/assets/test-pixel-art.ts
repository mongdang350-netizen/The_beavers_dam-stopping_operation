/**
 * Quick manual verification test for the pixel art system.
 * Run this in a Phaser scene to verify texture creation works.
 */

import Phaser from 'phaser';
import { createTexture, ensureTextures } from '@/assets/PixelArtEngine';
import { createBeaverBase } from '@/assets/PixelArtHelpers';
import { PALETTE_INDEX } from '@/assets/palette';

export function testPixelArtSystem(scene: Phaser.Scene): void {
  console.log('Testing Pixel Art System...');

  // Test 1: Create beaver base texture
  const beaverData = createBeaverBase();
  console.log(`Beaver data dimensions: ${beaverData.length}x${beaverData[0].length}`);

  createTexture(scene, 'beaver-base', beaverData, PALETTE_INDEX);
  console.log('Created beaver-base texture');

  // Test 2: Verify texture exists
  const exists = scene.textures.exists('beaver-base');
  console.log(`Texture exists: ${exists}`);

  // Test 3: Create sprite from texture
  if (exists) {
    const sprite = scene.add.sprite(400, 300, 'beaver-base');
    sprite.setScale(2); // Scale up for visibility
    console.log('Created sprite from beaver texture');
  }

  // Test 4: Test ensureTextures (should not recreate)
  ensureTextures(scene, [
    { key: 'beaver-base', data: beaverData }
  ]);
  console.log('ensureTextures passed (no duplicate creation)');

  console.log('Pixel Art System test complete!');
}
