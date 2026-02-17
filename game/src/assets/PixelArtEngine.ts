import Phaser from 'phaser';
import { PALETTE_INDEX } from '@/assets/palette';

/** Pixel data as 2D array of palette indices */
export type PixelData = readonly (readonly number[])[];

/**
 * Create a single CanvasTexture from pixel data.
 * Uses lazy generation: checks if texture already exists before creating.
 */
export function createTexture(
  scene: Phaser.Scene,
  key: string,
  pixelData: PixelData,
  palette: readonly number[] = PALETTE_INDEX
): void {
  if (textureExists(scene, key)) {
    return;
  }

  const height = pixelData.length;
  const width = pixelData[0]?.length || 0;

  if (width === 0 || height === 0) {
    console.warn(`Cannot create texture "${key}": invalid dimensions ${width}x${height}`);
    return;
  }

  const canvas = scene.textures.createCanvas(key, width, height);
  if (!canvas) {
    console.error(`Failed to create canvas texture "${key}"`);
    return;
  }

  const ctx = canvas.getContext();
  if (!ctx) {
    console.error(`Failed to get 2D context for texture "${key}"`);
    return;
  }

  // Draw each pixel
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const paletteIndex = pixelData[y][x];
      const color = palette[paletteIndex];

      // Skip transparent pixels (index 0 or color -1)
      if (paletteIndex === 0 || color === -1) {
        continue;
      }

      // Convert hex color to CSS string
      const colorStr = `#${color.toString(16).padStart(6, '0')}`;
      ctx.fillStyle = colorStr;
      ctx.fillRect(x, y, 1, 1);
    }
  }

  canvas.refresh();
}

/**
 * Create a spritesheet texture from multiple frames of pixel data.
 * Frames are laid out horizontally in a single row.
 */
export function createSpriteSheet(
  scene: Phaser.Scene,
  key: string,
  frames: readonly PixelData[],
  frameWidth: number,
  frameHeight: number,
  palette: readonly number[] = PALETTE_INDEX
): void {
  if (textureExists(scene, key)) {
    return;
  }

  const frameCount = frames.length;
  if (frameCount === 0) {
    console.warn(`Cannot create spritesheet "${key}": no frames provided`);
    return;
  }

  const totalWidth = frameWidth * frameCount;
  const canvas = scene.textures.createCanvas(key, totalWidth, frameHeight);
  if (!canvas) {
    console.error(`Failed to create spritesheet canvas "${key}"`);
    return;
  }

  const ctx = canvas.getContext();
  if (!ctx) {
    console.error(`Failed to get 2D context for spritesheet "${key}"`);
    return;
  }

  // Draw each frame side by side
  for (let frameIdx = 0; frameIdx < frameCount; frameIdx++) {
    const frameData = frames[frameIdx];
    const offsetX = frameIdx * frameWidth;

    for (let y = 0; y < frameHeight; y++) {
      for (let x = 0; x < frameWidth; x++) {
        const paletteIndex = frameData[y]?.[x] ?? 0;
        const color = palette[paletteIndex];

        // Skip transparent pixels
        if (paletteIndex === 0 || color === -1) {
          continue;
        }

        const colorStr = `#${color.toString(16).padStart(6, '0')}`;
        ctx.fillStyle = colorStr;
        ctx.fillRect(offsetX + x, y, 1, 1);
      }
    }
  }

  canvas.refresh();

  // Add individual frames so generateFrameNumbers() can find them
  const texture = scene.textures.get(key);
  for (let i = 0; i < frameCount; i++) {
    texture.add(i, 0, i * frameWidth, 0, frameWidth, frameHeight);
  }
}

/**
 * Check if a texture with the given key already exists (for lazy loading).
 */
export function textureExists(scene: Phaser.Scene, key: string): boolean {
  return scene.textures.exists(key);
}

/**
 * Ensure a list of textures are loaded. Only creates missing ones.
 */
export function ensureTextures(
  scene: Phaser.Scene,
  textureSpecs: Array<{ key: string; data: PixelData; palette?: readonly number[] }>
): void {
  for (const spec of textureSpecs) {
    createTexture(scene, spec.key, spec.data, spec.palette);
  }
}
